import type { ZodRawShape } from 'zod'
import { jsonParse } from '$lib/jsonParse.js'
import { addMemberComputedValues, parseQuery, prisma } from '$lib/server'
import type { Event, Field, Prisma, SubscribeState } from '@prisma/client'
import { z } from '$lib/validation'
import { error } from '@sveltejs/kit'

export const subscribesFilterShape = {
	search: z.string().optional(),
	start: z.date().optional(),
	end: z.date().optional(),
	teams: z.array(z.string()).optional(),
	states: z.string().optional(),
	createdBy: z.enum(['leader', 'user']).optional(),
	isAbsent: z.booleanAsString().optional(),
} satisfies ZodRawShape

export const getSubscribes = async (event: Event & { memberFields: Field[] }, url: URL) => {
	const eventId = event.id
	const { data, err } = parseQuery(url, {
		...subscribesFilterShape,
		all: z.boolean().default(false),
		skip: z.number().default(0),
		take: z.number().default(20),
	})
	if (err) error(400)

	const where: Prisma.SubscribeWhereInput = {}
	const team: Prisma.TeamWhereInput = { eventId }
	const period: Prisma.PeriodWhereInput = { team }

	if (data.teams) team.id = { in: data.teams }

	if (data.start && data.end) {
		period.start = { lte: data.end }
		period.end = { gte: data.start }
	}

	where.period = period

	if (data.search) {
		const words = data.search.split(' ')
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

	if (data.states) {
		const states = jsonParse<SubscribeState[]>(data.states, [])
		where.state = { in: states }
	}

	if (data.createdBy) where.createdBy = data.createdBy
	if (data.isAbsent !== undefined) where.isAbsent = data.isAbsent

	return {
		subscribes: await prisma.subscribe
			.findMany({
				where,
				skip: data.all ? undefined : data.skip,
				take: data.all ? undefined : data.take,
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
			),
	}
}
