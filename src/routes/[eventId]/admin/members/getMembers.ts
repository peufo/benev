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

	const filters: Prisma.MemberWhereInput[] = []
	const subscribesFilters: Prisma.SubscribeWhereInput[] = []

	if (query.search) {
		filters.push({
			user: {
				OR: [
					{ firstName: { contains: query.search } },
					{ lastName: { contains: query.search } },
					{ email: { contains: query.search } },
				],
			},
		})
	}

	if (query.subscribes_teams) {
		subscribesFilters.push({
			state: { in: ['accepted', 'request'] },
			period: { teamId: { in: query.subscribes_teams } },
		})
	}

	if (query.subscribes_range) {
		const { start, end } = query.subscribes_range
		subscribesFilters.push({
			state: 'accepted',
			period: {
				...(start && { end: { gte: start } }),
				...(end && { start: { lte: end } }),
			},
		})
	}

	if (query.leaderOf) {
		filters.push({
			leaderOf: { some: { id: { in: query.leaderOf } } },
		})
	}

	if (query.age) {
		const getDate = (age?: number) => {
			if (age === undefined) return undefined
			return dayjs().subtract(age, 'year').toDate()
		}
		const start = getDate(query.age.max)
		const end = getDate(query.age.min)
		filters.push({
			user: {
				birthday: {
					not: null,
					...(start && { gte: start }),
					...(end && { lte: end }),
				},
			},
		})
	}

	if (query.isValidedByEvent !== undefined) {
		filters.push({ isValidedByEvent: query.isValidedByEvent })
	}
	if (query.isValidedByUser !== undefined) {
		filters.push({ isValidedByUser: query.isValidedByUser })
	}
	if (query.isAbsent !== undefined) {
		filters.push({ subscribes: { some: { isAbsent: query.isAbsent } } })
	}

	if (query.role === 'admin') {
		filters.push({ isAdmin: true })
	}
	if (query.role === 'leader') {
		filters.push({ leaderOf: { some: { eventId } } })
	}
	if (query.role === 'member' || subscribesFilters.length) {
		subscribesFilters.push({ state: { in: ['request', 'accepted'] } })
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
		if (fieldFilter)
			filters.push({
				profileJson: {
					path: `$.${fieldId}`,
					...fieldFilter,
				},
			})
	}

	const filterOnComputedValues =
		query.subscribes_count_accepted !== undefined ||
		query.subscribes_count_request !== undefined ||
		query.subscribes_hours !== undefined ||
		query.isProfileComplet !== undefined

	let members = await prisma.member
		.findMany({
			where: {
				eventId,
				...(filters.length && { AND: filters }),
				...(subscribesFilters.length && {
					subscribes: {
						some: {
							AND: subscribesFilters,
						},
					},
				}),
			},
			include: {
				user: true,
				leaderOf: true,
				subscribes: {
					where: { AND: [{ state: { in: ['accepted', 'request'] } }, ...subscribesFilters] },
					include: { period: true },
				},
			},
			orderBy: {
				user: { firstName: 'asc' },
			},
		})
		.then((res) =>
			res.map((member) => ({
				...addMemberComputedValues({ ...member, event }),
				workTime: getWorkTime(member.subscribes, 'accepted'),
				workTimeRequest: getWorkTime(member.subscribes, 'request'),
			}))
		)

	if (filterOnComputedValues) {
		const conditions: ((member: (typeof members)[number]) => boolean)[] = []

		if (query.subscribes_count_accepted) {
			const { min, max } = query.subscribes_count_accepted
			if (min !== undefined)
				conditions.push((m) => min <= m.subscribes.filter((s) => s.state === 'accepted').length)
			if (max !== undefined)
				conditions.push((m) => max >= m.subscribes.filter((s) => s.state === 'accepted').length)
		}

		if (query.subscribes_count_request) {
			const { min, max } = query.subscribes_count_request
			if (min !== undefined)
				conditions.push((m) => min <= m.subscribes.filter((s) => s.state === 'request').length)
			if (max !== undefined)
				conditions.push((m) => max >= m.subscribes.filter((s) => s.state === 'request').length)
		}

		if (query.subscribes_hours) {
			const { min, max } = query.subscribes_hours

			const toHours = (ms: number) => ms / (1000 * 60 * 60)
			if (min !== undefined) conditions.push((m) => min <= toHours(m.workTime))
			if (max !== undefined) conditions.push((m) => max >= toHours(m.workTime))
		}

		if (query.isProfileComplet === true) {
			conditions.push((m) => m.isMemberProfileCompleted && m.isUserProfileCompleted)
		}
		if (query.isProfileComplet === false) {
			conditions.push((m) => !m.isMemberProfileCompleted || !m.isUserProfileCompleted)
		}

		members = members.filter((member) => {
			for (const condition of conditions) {
				if (!condition(member)) return false
			}
			return true
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
		if (acceptedCount) {
			if (!accepted[acceptedCount.toString()]) accepted[acceptedCount.toString()] = acceptedCount
			else accepted[acceptedCount.toString()] += acceptedCount
		}
		if (requestCount) {
			if (!request[requestCount.toString()]) request[requestCount.toString()] = requestCount
			else request[requestCount.toString()] += requestCount
		}
	})
	return { accepted, request }
}
