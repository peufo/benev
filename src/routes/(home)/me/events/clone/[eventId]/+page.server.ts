import { z } from 'fuma'
import { formAction } from 'fuma/server'
import { normalizePath } from '$lib/normalizePath'
import { permission, prisma } from '$lib/server'
import { clonePages, cloneData, cloneTeam } from '$lib/server/clone'
import { Prisma, type Field, type Page, type Period, type Team, type View } from '@prisma/client'

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
				name: eventName,
				activedAt,
				closeSubscribing,
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
			} = cloneData(event)
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
					memberFields: {
						create: memberFields.map(cloneData),
					},
				},
				include: { memberFields: true },
			})

			const fieldsMap = createFieldsMap(event.memberFields, newEvent.memberFields)
			const cloneWithFieldsMap = useCloneFieldsMap(newEvent.id, fieldsMap)

			await Promise.all([
				createOwner(newEvent.id, member.userId),
				cloneWithFieldsMap.views(views),
				cloneWithFieldsMap.teams(teams, deltaTime),
				cloneWithFieldsMap.pages(pages),
			])

			return newEvent
		},
		{
			redirectTo: (newEvent) => `/${newEvent.id}/admin/event`,
		}
	),
}

function createOwner(eventId: string, userId: string) {
	return prisma.member.create({
		data: {
			eventId,
			userId,
			isAdmin: true,
			isValidedByEvent: true,
			isValidedByUser: true,
		},
	})
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
	for (const source of fieldsSource) {
		const target = fieldsTarget.find(
			(target) => target.name === source.name && target.type === source.type
		)
		if (target) fieldsMap.set(source, target)
	}
	return fieldsMap
}

function useCloneFieldsMap(eventId: string, fieldsMap: Map<Field, Field>) {
	const fieldsMapId = new Map<string, Field>(
		fieldsMap.entries().map(([key, value]) => [key.id, value])
	)
	const regex = new RegExp(Array.from(fieldsMapId.keys()).join('|'), 'g')
	const replacer = (match: string) => fieldsMapId.get(match)?.id || ''

	return {
		views(views: View[]) {
			return prisma.view.createMany({
				data: views.map((view) => ({
					...cloneData(view),
					eventId,
					query: view.query.replace(regex, replacer),
				})),
			})
		},
		async teams(teams: (Team & { periods: Period[] })[], deltaTime: number) {
			for (const team of teams) {
				const conditions = team.conditions
				if (conditions) {
					for (const [fieldSource, fieldTarget] of fieldsMap) {
						for (const condition of conditions) {
							if (condition.type === 'profile' && condition.args.fieldId === fieldSource.id) {
								condition.args.fieldId = fieldTarget.id
							}
						}
					}
				}
				await prisma.team.create({
					data: {
						...cloneTeam(team, deltaTime),
						eventId,
						conditions: conditions || Prisma.JsonNull,
					},
				})
			}
		},
		pages(pages: Page[]) {
			return prisma.page.createMany({
				data: clonePages(pages).map((page) => ({
					...page,
					eventId,
					content: page.content.replace(regex, replacer),
				})),
			})
		},
	}
}
