import { z, type ZodObj } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { addMemberComputedValues, prisma } from '$lib/server'
import type {
	Event,
	Field,
	Prisma,
	Subscribe,
	SubscribeState,
	SubscribeCreatedBy,
} from '@prisma/client'

export const subscribesFilterShape = {
	search: z.string().optional(),
	teams: z.filter.multiselect,
	period: z.filter.range,
	states: z.filter.multiselect,
	createdBy: z.enum(['leader', 'user']).optional(),
	isAbsent: z.filter.boolean,
} satisfies ZodObj

export const getSubscribes = async (event: Event & { memberFields: Field[] }, url: URL) => {
	const eventId = event.id
	const query = parseQuery(url, {
		...subscribesFilterShape,
		all: z.filter.boolean,
		skip: z.coerce.number().default(0),
		take: z.coerce.number().default(20),
	})

	const subscribesFilters: Prisma.SubscribeWhereInput[] = [{ period: { team: { eventId } } }]

	if (query.teams) subscribesFilters.push({ period: { teamId: { in: query.teams } } })
	if (query.period) {
		const { start, end } = query.period
		subscribesFilters.push({
			period: {
				...(start && { end: { gte: start } }),
				...(end && { start: { lte: end } }),
			},
		})
	}

	if (query.search) {
		const words = query.search.split(' ')
		subscribesFilters.push({
			member: {
				user: {
					OR: words
						.map((word) => [
							{ firstName: { contains: word } },
							{ lastName: { contains: word } },
							{ email: { contains: word } },
						])
						.flat(),
				},
			},
		})
	}

	if (query.states) {
		subscribesFilters.push({ state: { in: query.states as SubscribeState[] } })
	}

	if (query.createdBy) subscribesFilters.push({ createdBy: query.createdBy })
	if (query.isAbsent !== undefined) subscribesFilters.push({ isAbsent: query.isAbsent })

	const subscribes = await prisma.subscribe
		.findMany({
			where: { AND: subscribesFilters },
			include: {
				period: {
					include: { team: true },
				},
				member: {
					include: {
						user: true,
						leaderOf: true,
					},
				},
			},
			orderBy: { period: { start: 'asc' } },
		})
		.then((subs) =>
			subs.map((sub) => ({
				...sub,
				member: addMemberComputedValues({ ...sub.member, event }),
			}))
		)

	return {
		subscribes: query.all ? subscribes : subscribes.slice(query.skip, query.skip + query.take),
		stats: {
			count: {
				total: subscribes.length,
				...subscribes.reduce((acc, cur) => ({ ...acc, [cur.createdBy]: acc[cur.createdBy] + 1 }), {
					leader: 0,
					user: 0,
				}),
			},
			dist: getSubscribesDist(subscribes),
		},
	}
}

type SubscribesDist = Record<SubscribeCreatedBy, Record<SubscribeState, number>>

function getSubscribesDist(subscribes: Subscribe[]): SubscribesDist {
	const initialValues: Record<SubscribeState, number> = {
		request: 0,
		denied: 0,
		accepted: 0,
		cancelled: 0,
	}
	const dist: SubscribesDist = { leader: { ...initialValues }, user: { ...initialValues } }
	subscribes.forEach((s) => dist[s.createdBy][s.state]++)
	return dist
}
