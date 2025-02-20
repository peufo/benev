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
	createdAt: z.filter.range,
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

	const where: Prisma.SubscribeWhereInput[] = [{ period: { team: { eventId } } }]
	const orderBy: Prisma.SubscribeOrderByWithRelationInput[] = []

	if (query.teams) where.push({ period: { teamId: { in: query.teams } } })
	if (query.createdAt) {
		const { start, end, order } = query.createdAt
		if (start) where.push({ createdAt: { gte: start } })
		if (end) where.push({ createdAt: { lte: end } })
		if (order) orderBy.push({ createdAt: order })
	}

	if (query.period) {
		const { start, end, order } = query.period
		if (start) where.push({ period: { end: { gte: start } } })
		if (end) where.push({ period: { start: { lte: end } } })
		if (order) orderBy.push({ period: { start: order } })
	}

	if (query.search) {
		const words = query.search.split(' ')
		where.push({
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
		where.push({ state: { in: query.states as SubscribeState[] } })
	}

	if (query.createdBy) where.push({ createdBy: query.createdBy })
	if (query.isAbsent !== undefined) where.push({ isAbsent: query.isAbsent })

	const subscribes = await prisma.subscribe
		.findMany({
			where: { AND: where },
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
			orderBy: orderBy.length ? orderBy : { period: { start: 'asc' } },
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
