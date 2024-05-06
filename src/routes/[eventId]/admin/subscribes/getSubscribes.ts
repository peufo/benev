import { error } from '@sveltejs/kit'
import { z, type ZodObj } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import { addMemberComputedValues, prisma } from '$lib/server'
import type { Event, Field, Prisma, SubscribeState } from '@prisma/client'

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
		all: z.boolean().default(false),
		skip: z.number().default(0),
		take: z.number().default(20),
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

	return {
		subscribes: await prisma.subscribe
			.findMany({
				where: { AND: subscribesFilters },
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
