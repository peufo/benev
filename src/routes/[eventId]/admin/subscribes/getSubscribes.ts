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
	const data = parseQuery(url, {
		...subscribesFilterShape,
		all: z.boolean().default(false),
		skip: z.number().default(0),
		take: z.number().default(20),
	})

	const subscribesFilters: Prisma.SubscribeWhereInput[] = [{ period: { team: { eventId } } }]

	if (data.teams) subscribesFilters.push({ period: { teamId: { in: data.teams } } })
	if (data.period) {
		const { start, end } = data.period
		subscribesFilters.push({
			period: {
				...(start && { end: { gte: start } }),
				...(end && { start: { lte: end } }),
			},
		})
	}

	if (data.search) {
		const words = data.search.split(' ')
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

	if (data.states) {
		subscribesFilters.push({ state: { in: data.states as SubscribeState[] } })
	}

	if (data.createdBy) subscribesFilters.push({ createdBy: data.createdBy })
	if (data.isAbsent !== undefined) subscribesFilters.push({ isAbsent: data.isAbsent })

	return {
		subscribes: await prisma.subscribe
			.findMany({
				where: { AND: subscribesFilters },
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
