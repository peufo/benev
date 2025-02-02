import { defaultEmailModels } from '$lib/email/models'
import { normalizePath } from '$lib/normalizePath'
import { permission, prisma } from '$lib/server'
import type { Page, PageType, Period, Prisma, Team } from '@prisma/client'
import { z } from 'fuma'
import { formAction } from 'fuma/server'

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
	pages: z.array(z.string()),
	fields: z.array(z.string()),
	views: z.array(z.string()),
	teams: z.array(z.string()),
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
			const name = await getAvailableCloneName(event.name)
			const newEvent: Prisma.EventCreateInput = {
				id: normalizePath(name),
				name,
				description: event.description,
				email: event.email,
				phone: event.phone,
				web: event.web,
				address: event.address,
				facebook: event.facebook,
				instagram: event.instagram,
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
					create: event.teams.map((t) => pickTeam(t, data.deltaDays)),
				},
				pages: {
					create: getPages(event.pages),
				},
				memberFields: {
					create: event.memberFields.map(pickData),
				},
				views: {
					create: event.views.map(pickData),
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

type ExcludeProps = 'id' | 'createdAt' | 'updatedAt' | 'eventId'
function pickData<T extends object>(data: T) {
	const { id, createdAt, updatedAt, eventId, ...rest } = data as Record<ExcludeProps, unknown>
	return rest as Omit<T, ExcludeProps>
}

function pickTeam(
	team: Team & { periods: Period[] },
	deltaDays: number
): Prisma.TeamCreateWithoutEventInput {
	return {
		name: team.name,
		description: team.description,
		closeSubscribing: team.closeSubscribing,
		// TODO: fix fields references
		//conditions: team.conditions || undefined,
		position: team.position,
		periods: {
			create: team.periods.map((p) => pickPeriod(p, deltaDays)),
		},
	}
}

function pickPeriod(period: Period, deltaDays: number): Prisma.PeriodCreateWithoutTeamInput {
	const deltaTime = deltaDays * 1000 * 60 * 60 * 24
	return {
		maxSubscribe: period.maxSubscribe,
		start: new Date(period.start.getTime() + deltaTime),
		end: new Date(period.end.getTime() + deltaTime),
	}
}

function getPages(eventPages: Page[]): Prisma.PageCreateManyEventInput[] {
	const home = pickData(
		eventPages.find((p) => p.type === 'home') || {
			type: 'home' as PageType,
			title: 'Bienvenue',
			path: 'bienvenue',
			content: 'null',
		}
	)
	const emails = defaultEmailModels.map((page) => {
		const eventPage = eventPages.find((p) => p.path === page.path)
		return eventPage ? pickData(eventPage) : page
	})
	const rest = eventPages.filter((p) => p.type !== 'home' && p.type !== 'email').map(pickData)
	return [home, ...emails, ...rest]
}
