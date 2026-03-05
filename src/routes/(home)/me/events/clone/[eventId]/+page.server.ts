import { z } from 'fuma'
import { formAction } from 'fuma/server'
import { normalizePath } from '$lib/normalizePath'
import { permission, prisma } from '$lib/server'
import { clonePages, cloneData, cloneTeam } from '$lib/server/clone'
import type { Prisma } from '@prisma/client'

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
			const newEvent: Prisma.EventCreateInput = {
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
				views: {
					create: views.map(cloneData),
				},
			}
			return prisma.event.create({
				data: newEvent,
			})
		},
		{
			redirectTo: (event) => `/${event.id}/admin/event`,
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
