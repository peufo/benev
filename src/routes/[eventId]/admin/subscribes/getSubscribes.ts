import { jsonParse } from '$lib/jsonParse.js'
import { getMemberRole, parseQuery, prisma } from '$lib/server'
import { Prisma, SubscribeState } from '@prisma/client'
import { error } from '@sveltejs/kit'
import { z } from 'zod'

export const getSubscribes = async (eventId: string, url: URL) => {
	const query = parseQuery(
		url,
		z.object({
			search: z.string().optional(),
			start: z.coerce.date().optional(),
			end: z.coerce.date().optional(),
			teams: z.string().optional(),
			states: z.string().optional(),
			skip: z.coerce.number().default(0),
			take: z.coerce.number().default(20),
			// TODO: use enum provided by prisma for "createdBy" -> SubscribeCreatedBy
			createdBy: z.enum(['leader', 'user']).optional(),
			all: z.coerce.boolean().default(false),
		})
	)

	const where: Prisma.SubscribeWhereInput = {}
	const team: Prisma.TeamWhereInput = { eventId }
	const period: Prisma.PeriodWhereInput = { team }

	if (query.teams) {
		try {
			const teams = JSON.parse(query.teams) as string[]
			team.id = { in: teams }
		} catch {
			throw error(400, '"teams is not a valid JSON of type string[]')
		}
	}

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

	if (query.createdBy) {
		where.createdBy = query.createdBy
	}

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
							event: { select: { ownerId: true } },
							leaderOf: true,
						},
					},
				},
				orderBy: { period: { start: 'asc' } },
			})
			.then((subs) =>
				subs.map((sub) => ({
					...sub,
					member: {
						...sub.member,
						role: getMemberRole(sub.member),
					},
				}))
			),
	}
}
