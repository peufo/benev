import { jsonParse } from '$lib/jsonParse.js'
import { addMemberComputedValues, parseQuery, prisma } from '$lib/server'
import type { Event, Field, Prisma, SubscribeState } from '@prisma/client'
import { z } from '$lib/validation'

export const getSubscribes = async (event: Event & { memberFields: Field[] }, url: URL) => {
	const eventId = event.id
	const query = parseQuery(url, {
		search: z.string().optional(),
		start: z.date().optional(),
		end: z.date().optional(),
		teams: z.array(z.string()).optional(),
		states: z.string().optional(),
		skip: z.number().default(0),
		take: z.number().default(20),
		// TODO: use enum provided by prisma for "createdBy" -> SubscribeCreatedBy
		createdBy: z.enum(['leader', 'user']).optional(),
		isAbsent: z.booleanAsString().optional(),
		all: z.boolean().default(false),
	})

	const where: Prisma.SubscribeWhereInput = {}
	const team: Prisma.TeamWhereInput = { eventId }
	const period: Prisma.PeriodWhereInput = { team }

	if (query.teams) team.id = { in: query.teams }

	if (query.start && query.end) {
		period.start = { lte: query.end }
		period.end = { gte: query.start }
	}

	where.period = period

	if (query.search) {
		const words = query.search.split(' ')
		where.member = {
			user: {
				OR: words
					.map((word) => [
						{ firstName: { contains: word } },
						{ lastName: { contains: word } },
						{ email: { contains: word } },
					])
					.flat(),
			},
		}
	}

	if (query.states) {
		const states = jsonParse<SubscribeState[]>(query.states, [])
		where.state = { in: states }
	}

	if (query.createdBy) where.createdBy = query.createdBy
	if (query.isAbsent !== undefined) where.isAbsent = query.isAbsent

	return {
		subscribes: await prisma.subscribe
			.findMany({
				where,
				skip: query.all ? undefined : query.skip,
				take: query.all ? undefined : query.take,
				include: {
					period: {
						include: { team: true },
					},
					member: {
						include: {
							user: true,
							leaderOf: true,
							profile: { include: { field: true } },
						},
					},
				},
				orderBy: { period: { start: 'asc' } },
			})
			.then((subs) =>
				subs.map((sub) => ({
					...sub,
					// TODO: all memberComputedValues are required ?
					member: addMemberComputedValues({ ...sub.member, event }),
				}))
			),
	}
}
