import { z } from 'fuma'
import { formAction } from 'fuma/server'
import { normalizePath } from '$lib/normalizePath'
import { permission, prisma } from '$lib/server'
import { clonePages, cloneData, cloneTeam } from '$lib/server/clone'
import { Prisma, type Field } from '@prisma/client'

export const load = async ({ locals, params: { eventId } }) => {
	await permission.admin(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: {
			teams: {
				include: { periods: true },
			},
			memberFields: true,
			pages: true,
			views: true,
		},
	})
	return { event }
}

const validationEventClone = {
	deltaDays: z.number(),
	pages: z.jsonArray(z.string()),
	fields: z.jsonArray(z.string()),
	views: z.jsonArray(z.string()),
	teams: z.jsonArray(z.string()),
}

export const actions = {
	event_clone: formAction(
		validationEventClone,
		async ({ data, locals, params }) => {
			const member = await permission.admin(params.eventId, locals)
			const event = await prisma.event.findUniqueOrThrow({
				where: { id: params.eventId },
				include: {
					teams: {
						where: { id: { in: data.teams } },
						include: { periods: true },
					},
					memberFields: { where: { id: { in: data.fields } } },
					pages: { where: { id: { in: data.pages } } },
					views: { where: { id: { in: data.views } } },
				},
			})
			const {
				id,
				name: eventName,
				activedAt,
				closeSubscribing,
				createdAt,
				deletedAt,
				missingLicencesMember,
				ownerId,
				teams,
				pages,
				memberFields,
				views,
				backgroundImageId,
				logoId,
				posterId,
				...copiedData
			} = event
			const deltaTime = data.deltaDays * 1000 * 60 * 60 * 24
			const name = await getAvailableCloneName(eventName)
			const newEvent = await prisma.event.create({
				data: {
					...copiedData,
					id: normalizePath(name),
					name,
					closeSubscribing: closeSubscribing && new Date(closeSubscribing.getTime() + deltaTime),
					backgroundImage: backgroundImageId ? { connect: { id: backgroundImageId } } : {},
					logo: logoId ? { connect: { id: logoId } } : {},
					owner: { connect: { id: member.userId } },
					members: {
						create: {
							userId: member.userId,
							isAdmin: true,
							isValidedByEvent: true,
							isValidedByUser: true,
						},
					},
					teams: {
						create: teams.map((t) => cloneTeam(t, deltaTime)),
					},
					pages: {
						create: clonePages(pages),
					},
					memberFields: {
						create: memberFields.map(cloneData),
					},
				},
				include: { memberFields: true },
			})

			const fieldsMap = createFieldsMap(newEvent.memberFields, event.memberFields)

			// Importation des vues avec mapping des memberFields
			await prisma.view.createMany({
				data: event.views.map((sourceView) => {
					let query = sourceView.query
					for (const [fieldTarget, fieldSource] of fieldsMap) {
						query = query.replaceAll(fieldSource.id, fieldTarget.id)
					}
					return { ...cloneData(sourceView), query, eventId: newEvent.id }
				}),
			})

			// TODO: import members

			return newEvent
		},
		{
			redirectTo: (newEvent) => `/${newEvent.id}/admin/event`,
		}
	),
}

async function getAvailableCloneName(eventName: string): Promise<string> {
	const names = await prisma.event
		.findMany({
			where: { name: { startsWith: eventName } },
			select: { name: true },
		})
		.then((events) => events.map((e) => e.name))
	let suffix = 1
	while (names.includes(`${eventName}_${suffix}`)) suffix++
	return `${eventName}_${suffix}`
}

function createFieldsMap(fieldsSource: Field[], fieldsTarget: Field[]): Map<Field, Field> {
	const fieldsMap = new Map<Field, Field>()
	for (const fieldSource of fieldsSource) {
		const fieldTarget = fieldsTarget.find((f) => f.name === fieldSource.name)
		if (fieldTarget) fieldsMap.set(fieldSource, fieldTarget)
	}
	return fieldsMap
}
