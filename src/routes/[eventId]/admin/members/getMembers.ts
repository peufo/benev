import { z } from '$lib/validation'
import type { Event, Field, Prisma } from '@prisma/client'
import { parseQuery, prisma, addMemberComputedValues } from '$lib/server'
import { error } from '@sveltejs/kit'
import { jsonParse } from '$lib/jsonParse'

export const getMembers = async (event: Event & { memberFields: Field[] }, url: URL) => {
	const eventId = event.id
	const { data, err } = parseQuery(url, {
		search: z.string().optional(),
		start: z.date().optional(),
		end: z.date().optional(),
		teams: z.array(z.string()).optional(),
		role: z.enum(['member', 'leader', 'admin']).optional(),
		fieldId: z.string().optional(),
		fieldValue: z.string().optional(),
		skip: z.number().default(0),
		take: z.number().default(20),
		summary: z.boolean().default(false),
		isAbsent: z.booleanAsString().optional(),
		all: z.boolean().default(false),
	})

	if (err) throw error(400)

	const where: Prisma.MemberWhereInput = { eventId, OR: [] }
	const teamWhere: Prisma.TeamWhereInput = { eventId }
	let periodWhere: Prisma.PeriodWhereInput | undefined = undefined

	if (data.start && data.end) {
		periodWhere = {
			start: { lte: data.end },
			end: { gte: data.start },
		}
	}

	if (data.teams) teamWhere.id = { in: data.teams }

	const subscribeWhere: Prisma.SubscribeWhereInput = {
		state: { in: ['request', 'accepted'] },
		period: {
			...periodWhere,
			team: teamWhere,
		},
	}

	if (data.role === 'member') subscribeWhere.isAbsent = data.isAbsent

	const subscribesFilter = !!(data.role || data.start || data.end || data.teams)
	if (subscribesFilter) {
		if (!data.role || data.role === 'member')
			where.OR!.push({
				subscribes: {
					some: subscribeWhere,
				},
			})

		if (!data.role || data.role === 'leader')
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

	if (data.role === 'admin') where.isAdmin = true

	if (!where.OR?.length) delete where.OR

	if (data.search)
		where.user = {
			OR: [
				{ firstName: { contains: data.search } },
				{ lastName: { contains: data.search } },
				{ email: { contains: data.search } },
			],
		}

	if (data.fieldId && data.fieldValue) {
		const field = await prisma.field.findUniqueOrThrow({ where: { id: data.fieldId, eventId } })
		where.profile = {
			some: {
				fieldId: data.fieldId,
				value:
					field.type === 'multiselect' ? { contains: `"${data.fieldValue}"` } : data.fieldValue,
			},
		}
	}

	const members = await prisma.member
		.findMany({
			where,
			skip: data.summary || data.all ? undefined : data.skip,
			take: data.summary || data.all ? undefined : data.take,
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
				...addMemberComputedValues({ ...member, event }),
				workTime: member.subscribes.reduce((acc, { period }) => {
					const time = period.end.getTime() - period.start.getTime()
					return acc + time
				}, 0),
			}))
		)

	if (!data.summary) return { members }

	const [periods, fields] = await Promise.all([
		prisma.period.findMany({
			where: { ...periodWhere, team: { eventId, ...teamWhere } },
			include: {},
		}),
		prisma.field.findMany({ where: { eventId }, orderBy: { position: 'asc' } }),
	])

	return {
		members: members.slice(data.skip, data.skip + data.take),
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
										: jsonParse<string[]>(value, [])

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
