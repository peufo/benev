import { z, type ZodObj } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import dayjs from 'dayjs'
import type {
	Event,
	Field,
	FieldType,
	Member,
	Period,
	Prisma,
	Subscribe,
	SubscribeState,
} from '@prisma/client'
import { prisma, addMemberComputedValues, type MemberWithComputedValues } from '$lib/server'

export type MemberWithComputedValue = Awaited<ReturnType<typeof getMembers>>['members'][number]

export const membersFilterShape = {
	search: z.string().optional(),
	createdAt: z.filter.range,
	subscribes_count_accepted: z.filter.number,
	subscribes_count_request: z.filter.number,
	subscribes_teams: z.filter.multiselect,
	subscribes_range: z.filter.range,
	subscribes_hours: z.filter.number,
	leaderOf: z.filter.multiselect,
	age: z.filter.number,
	isProfileComplet: z.filter.boolean,
	isValidedByEvent: z.filter.boolean,
	isValidedByUser: z.filter.boolean,
	isAbsent: z.filter.boolean,
	role: z.enum(['member', 'leader', 'admin']).optional(),
} satisfies ZodObj

export const getMembers = async (event: Event & { memberFields: Field[] }, url: URL) => {
	const eventId = event.id

	const query = parseQuery(url, {
		...membersFilterShape,
		skip: z.coerce.number().default(0),
		take: z.coerce.number().default(20),
		all: z.filter.boolean,
	})

	const where: Prisma.MemberWhereInput[] = []
	const subscribesWhere: Prisma.SubscribeWhereInput[] = []
	const orderBy: Prisma.MemberOrderByWithRelationInput[] = []

	if (query.search) {
		where.push({
			user: {
				OR: [
					{ firstName: { contains: query.search } },
					{ lastName: { contains: query.search } },
					{ email: { contains: query.search } },
				],
			},
		})
	}

	if (query.createdAt) {
		const { start, end, order } = query.createdAt
		if (start) where.push({ createdAt: { gte: start } })
		if (end) where.push({ createdAt: { lte: end } })
		if (order) orderBy.push({ createdAt: order })
	}

	if (query.subscribes_teams) {
		subscribesWhere.push({
			state: { in: ['accepted', 'request'] },
			period: { teamId: { in: query.subscribes_teams } },
		})
	}

	if (query.subscribes_range) {
		const { start, end } = query.subscribes_range
		subscribesWhere.push({
			state: 'accepted',
			period: {
				...(start && { end: { gte: start } }),
				...(end && { start: { lte: end } }),
			},
		})
	}

	if (query.leaderOf) {
		where.push({
			leaderOf: { some: { id: { in: query.leaderOf } } },
		})
	}

	if (query.age) {
		const { min, max, order } = query.age
		const getDate = (age?: number) => {
			if (age === undefined) return undefined
			return dayjs().subtract(age, 'year').toDate()
		}
		if (min || max || order) where.push({ user: { birthday: { not: null } } })
		if (min) where.push({ user: { birthday: { lte: getDate(min) } } })
		if (max) where.push({ user: { birthday: { gte: getDate(max) } } })
		if (order === 'asc') orderBy.push({ user: { birthday: 'desc' } })
		if (order === 'desc') orderBy.push({ user: { birthday: 'asc' } })
	}

	if (query.isValidedByEvent !== undefined) {
		where.push({ isValidedByEvent: query.isValidedByEvent })
	}
	if (query.isValidedByUser !== undefined) {
		where.push({ isValidedByUser: query.isValidedByUser })
	}
	if (query.isAbsent !== undefined) {
		where.push({ subscribes: { some: { isAbsent: query.isAbsent } } })
	}

	if (query.role === 'admin') {
		where.push({ isAdmin: true })
	}
	if (query.role === 'leader') {
		where.push({ leaderOf: { some: { eventId } } })
	}
	if (query.role === 'member' || subscribesWhere.length) {
		subscribesWhere.push({ state: { in: ['request', 'accepted'] } })
	}

	// TODO: use this in src/routes/[eventId]/teams/membersAllowed/+server.ts
	const fieldFilterByType: Record<
		FieldType,
		(query: string) => Prisma.JsonNullableFilter<'Member'> | null
	> = {
		string: (query) => ({ string_contains: query }),
		textarea: (query) => ({ string_contains: query }),
		select: (query) => ({ equals: query }),
		boolean: (query) => {
			const parsed = z.filter.boolean.safeParse(query)
			if (!parsed.success || parsed.data === undefined) return null
			return { equals: parsed.data }
		},
		number: (query) => {
			const parsed = z.filter.number.safeParse(query)
			if (!parsed.success) return null
			const filter: Prisma.JsonNullableFilter<'Member'> = {}
			if (parsed.data?.min) filter.gte = parsed.data?.min
			if (parsed.data?.max) filter.lte = parsed.data?.max
			return filter
		},
		multiselect: (query) => {
			const parsed = z.filter.multiselect.safeParse(query)
			if (!parsed.success || !parsed.data) return null
			return { array_contains: parsed.data }
		},
	}

	for (const [key, value] of url.searchParams.entries()) {
		if (!key.startsWith('field_')) continue
		const fieldId = key.replace('field_', '')
		const field = await prisma.field.findUniqueOrThrow({ where: { id: fieldId, eventId } })
		const fieldFilter = fieldFilterByType[field.type](value)
		if (fieldFilter) {
			where.push({
				profileJson: {
					path: `$.${fieldId}`,
					...fieldFilter,
				},
			})
		}
	}

	const filterOnComputedValues =
		query.subscribes_count_accepted !== undefined ||
		query.subscribes_count_request !== undefined ||
		query.subscribes_hours !== undefined ||
		query.isProfileComplet !== undefined

	orderBy.push({
		user: { firstName: 'asc' },
	})

	let members = await prisma.member
		.findMany({
			where: {
				eventId,
				...(where.length && { AND: where }),
				...(subscribesWhere.length && {
					subscribes: {
						some: {
							AND: subscribesWhere,
						},
					},
				}),
			},
			include: {
				leaderOf: true,
				subscribes: {
					where: { AND: [{ state: { in: ['accepted', 'request'] } }, ...subscribesWhere] },
					include: { period: true },
				},
			},
			orderBy,
		})
		.then((res) =>
			res.map((member) => ({
				...addMemberComputedValues({ ...member, event }),
				workTime: getWorkTime(member.subscribes, 'accepted'),
				workTimeRequest: getWorkTime(member.subscribes, 'request'),
				subscribesCountAccepted: member.subscribes.filter((s) => s.state === 'accepted').length,
				subscribesCountRequest: member.subscribes.filter((s) => s.state === 'request').length,
			}))
		)

	if (filterOnComputedValues) {
		type M = (typeof members)[number]
		const conditions: ((member: M) => boolean)[] = []
		const sorts: ((a: M, b: M) => number)[] = []
		if (query.subscribes_count_accepted) {
			const { min, max, order } = query.subscribes_count_accepted
			if (min !== undefined) conditions.push((m) => min <= m.subscribesCountAccepted)
			if (max !== undefined) conditions.push((m) => max >= m.subscribesCountAccepted)
			if (order === 'asc')
				sorts.push((a, b) => a.subscribesCountAccepted - b.subscribesCountAccepted)
			if (order === 'desc')
				sorts.push((a, b) => b.subscribesCountAccepted - a.subscribesCountAccepted)
		}

		if (query.subscribes_count_request) {
			const { min, max, order } = query.subscribes_count_request
			if (min !== undefined) conditions.push((m) => min <= m.subscribesCountRequest)
			if (max !== undefined) conditions.push((m) => max >= m.subscribesCountRequest)
			if (order === 'asc')
				sorts.push((a, b) => a.subscribesCountAccepted - b.subscribesCountAccepted)
			if (order === 'desc')
				sorts.push((a, b) => b.subscribesCountAccepted - a.subscribesCountAccepted)
		}

		if (query.subscribes_hours) {
			const { min, max, order } = query.subscribes_hours
			if (min !== undefined) {
				const min_ms = min * (1000 * 60 * 60)
				conditions.push((m) => min_ms <= m.workTime)
			}
			if (max !== undefined) {
				const max_ms = max * (1000 * 60 * 60)
				conditions.push((m) => max_ms >= m.workTime)
			}
			if (order === 'asc') sorts.push((a, b) => a.workTime - b.workTime)
			if (order === 'desc') sorts.push((a, b) => b.workTime - a.workTime)
		}

		if (query.isProfileComplet === true) {
			conditions.push((m) => m.isMemberProfileCompleted && m.isUserProfileCompleted)
		}
		if (query.isProfileComplet === false) {
			conditions.push((m) => !m.isMemberProfileCompleted || !m.isUserProfileCompleted)
		}

		members = members
			.filter((member) => {
				for (const condition of conditions) {
					if (!condition(member)) return false
				}
				return true
			})
			.sort((a, b) => {
				// TODO: sorts erase orderBy... tofix: edit sorts at the same time at orderBy
				for (const sort of sorts) {
					const res = sort(a, b)
					if (res) return res
				}
				return 0
			})
	}

	const fields = await prisma.field.findMany({ where: { eventId }, orderBy: { position: 'asc' } })

	return {
		members: query.all ? members : members.slice(query.skip, query.skip + query.take),
		stats: {
			nbMembers: members.length,
			membership: getMembershipDistribution(members),
			profileStatus: getMembersProfilStatusDistribution(members),
			subscribes: getMembersSubscribesDistribution(members),
			summary: fields
				.map((field) => {
					if (field.type === 'select' || field.type === 'multiselect') {
						return {
							fieldId: field.id,
							fieldName: field.name,
							fieldType: field.type,
							distribution: members.reduce((acc, { profileJson }) => {
								const value = profileJson[field.id]
								if (value === undefined) return acc
								const keys = Array.isArray(value) ? value : [String(value)]
								keys.forEach((key) => {
									if (!key) return
									if (acc[key]) acc = { ...acc, [key]: acc[key] + 1 }
									else acc = { ...acc, [key]: 1 }
								})
								return acc
							}, {} as Record<string, number>),
						}
					} else if (field.type === 'boolean') {
						return {
							fieldId: field.id,
							fieldName: field.name,
							fieldType: field.type,
							distribution: members.reduce((acc, { profileJson }) => {
								const value = profileJson[field.id]
								if (typeof value !== 'boolean') return acc
								const key = value ? 'true' : 'false'
								if (acc[key]) acc = { ...acc, [key]: acc[key] + 1 }
								else acc = { ...acc, [key]: 1 }
								return acc
							}, {} as Record<string, number>),
						}
					}
				})
				.filter(Boolean),
		},
	}
}

function getWorkTime(
	subscribes: (Subscribe & { period: Period })[],
	state: SubscribeState
): number {
	return subscribes
		.filter((sub) => sub.state === state)
		.reduce((acc, { period }) => {
			const time = period.end.getTime() - period.start.getTime()
			return acc + time
		}, 0)
}

export type MembershipDistKey = 'isValided' | 'isValidedByEvent' | 'isValidedByUser'
function getMembershipDistribution(members: Member[]): Record<MembershipDistKey, number> {
	const dist = {
		isValided: 0,
		isValidedByEvent: 0,
		isValidedByUser: 0,
	} satisfies Record<MembershipDistKey, number>

	members.forEach(({ isValidedByEvent, isValidedByUser }) => {
		if (isValidedByEvent && isValidedByUser) dist.isValided++
		else if (!isValidedByEvent && isValidedByUser) dist.isValidedByUser++
		else if (isValidedByEvent && !isValidedByUser) dist.isValidedByEvent++
	})

	return dist
}

export type MembersProfilDistKey = 'isComplet' | 'isIncomplet'
function getMembersProfilStatusDistribution(
	members: MemberWithComputedValues[]
): Record<MembersProfilDistKey, number> {
	const dist = {
		isComplet: 0,
		isIncomplet: 0,
	} satisfies Record<MembersProfilDistKey, number>

	members.forEach((m) => {
		if (m.isMemberProfileCompleted && m.isUserProfileCompleted) dist.isComplet++
		else dist.isIncomplet++
	})

	return dist
}

function getMembersSubscribesDistribution(members: (Member & { subscribes: Subscribe[] })[]) {
	const accepted: Record<string, number> = {}
	const request: Record<string, number> = {}
	members.forEach((m) => {
		const acceptedCount = m.subscribes.filter((s) => s.state === 'accepted').length
		const requestCount = m.subscribes.filter((s) => s.state === 'request').length

		if (!accepted[acceptedCount.toString()]) accepted[acceptedCount.toString()] = 1
		else accepted[acceptedCount.toString()]++

		if (!request[requestCount.toString()]) request[requestCount.toString()] = 1
		else request[requestCount.toString()]++
	})
	return { accepted, request }
}
