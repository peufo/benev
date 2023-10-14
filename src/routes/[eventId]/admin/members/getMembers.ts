import { error } from '@sveltejs/kit'
import z from 'zod'
import type { Prisma } from '@prisma/client'
import { parseQuery, prisma } from '$lib/server'

export const getMembers = async (eventId: string, url: URL) => {
	const query = parseQuery(
		url,
		z.object({
			search: z.string().optional(),
			start: z.coerce.date().optional(),
			end: z.coerce.date().optional(),
			teams: z.string().optional(),
			memberType: z.string().optional(),
			fieldId: z.string().optional(),
			fieldValue: z.string().optional(),
			skip: z.coerce.number().default(0),
			take: z.coerce.number().default(20),
			summary: z.coerce.boolean().default(false),
			all: z.coerce.boolean().default(false),
		})
	)

	const where: Prisma.MemberWhereInput = { eventId, OR: [] }
	const teamWhere: Prisma.TeamWhereInput = { eventId }
	let periodWhere: Prisma.PeriodWhereInput | undefined = undefined

	if (query.start && query.end) {
		periodWhere = {
			start: { lte: query.end },
			end: { gte: query.start },
		}
	}

	if (query.teams) {
		try {
			const teams = JSON.parse(query.teams) as string[]
			teamWhere.id = { in: teams }
		} catch {
			throw error(400, '"teams is not a valid JSON of type string[]')
		}
	}

	const subscribeWhere: Prisma.SubscribeWhereInput = {
		state: { in: ['request', 'accepted'] },
		period: {
			...periodWhere,
			team: teamWhere,
		},
	}

	const subscribesFilter = !!(query.memberType || query.start || query.end || query.teams)
	if (subscribesFilter) {
		if (!query.memberType || query.memberType === 'volunteers')
			where.OR!.push({
				subscribes: {
					some: subscribeWhere,
				},
			})
		if (!query.memberType || query.memberType === 'leaders')
			where.OR!.push({
				leaderOf: {
					some: {
						...teamWhere,
						...(periodWhere && {
							periods: {
								some: periodWhere,
							},
						}),
					},
				},
			})
	}

	if (!where.OR?.length) delete where.OR

	if (query.search)
		where.user = {
			OR: [
				{ firstName: { contains: query.search } },
				{ lastName: { contains: query.search } },
				{ email: { contains: query.search } },
			],
		}

	if (query.fieldId && query.fieldValue) {
		const field = await prisma.field.findUniqueOrThrow({ where: { id: query.fieldId, eventId } })
		where.profile = {
			some: {
				fieldId: query.fieldId,
				value:
					field.type === 'multiselect' ? { contains: `"${query.fieldValue}"` } : query.fieldValue,
			},
		}
	}

	const members = await prisma.member
		.findMany({
			where,
			skip: query.summary || query.all ? undefined : query.skip,
			take: query.summary || query.all ? undefined : query.take,
			include: {
				user: true,
				leaderOf: true,
				profile: true,
				subscribes: {
					where: subscribeWhere,
					include: {
						period: true,
					},
				},
			},
			orderBy: {
				user: { firstName: 'asc' },
			},
		})
		.then((res) =>
			res.map((member) => ({
				...member,
				workTime: member.subscribes.reduce((acc, { period }) => {
					const time = period.end.getTime() - period.start.getTime()
					return acc + time
				}, 0),
			}))
		)

	if (!query.summary) return { members }

	const [periods, fields] = await Promise.all([
		prisma.period.findMany({
			where: { ...periodWhere, team: { eventId, ...teamWhere } },
			include: {},
		}),
		prisma.field.findMany({ where: { eventId } }),
	])

	return {
		members: members.slice(query.skip, query.skip + query.take),
		stats: {
			nbMembers: members.length,
			nbSubscribes: members.reduce((acc, cur) => acc + cur.subscribes.length, 0),
			nbSubscribesTime: members.reduce((acc, cur) => acc + cur.workTime, 0),
			totalSlots: periods.reduce((acc, cur) => acc + cur.maxSubscribe, 0),
			totalSlotsTime: periods.reduce(
				(acc, cur) => acc + cur.maxSubscribe * (cur.end.getTime() - cur.start.getTime()),
				0
			),
			summary: fields
				.map((field) => {
					if (field.type === 'select' || field.type === 'multiselect') {
						return {
							name: field.name,
							distribution: members.reduce((acc, { profile }) => {
								const { value } = profile.find((v) => v.fieldId === field.id) || { value: '' }
								if (!value) return acc
								const keys =
									field.type === 'select'
										? [value]
										: field.allCombinations
										? [value.replaceAll(/[\[\"\]]/g, '').replaceAll(',', ', ')]
										: (JSON.parse(value) as string[])

								keys.forEach((key) => {
									if (!key) return
									if (acc[key]) return (acc = { ...acc, [key]: acc[key] + 1 })
									acc = { ...acc, [key]: 1 }
								})
								return acc
							}, {} as Record<string, number>),
						}
					}
				})
				.filter(Boolean),
		},
	}
}