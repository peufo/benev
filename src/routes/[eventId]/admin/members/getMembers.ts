import { z, type ZodObj } from 'fuma/validation'
import { parseQuery } from 'fuma/server'
import dayjs from 'dayjs'
import type {
	Event,
	Field,
	FieldType,
	Period,
	Prisma,
	Subscribe,
	SubscribeState,
} from '@prisma/client'
import { prisma, addMemberComputedValues } from '$lib/server'

export type Member = Awaited<ReturnType<typeof getMembers>>['members'][number]

export const membersFilterShape = {
	search: z.string().optional(),
	subscribes_count: z.filter.number,
	subscribes_teams: z.filter.multiselect,
	subscribes_range: z.filter.range,
	subscribes_hours: z.filter.number,
	leaderOf: z.filter.multiselect,
	age: z.filter.number,
	isUserProfileCompleted: z.filter.boolean,
	isValidedByEvent: z.filter.boolean,
	isValidedByUser: z.filter.boolean,
	isAbsent: z.filter.boolean,
	role: z.enum(['member', 'leader', 'admin']).optional(),
} satisfies ZodObj

export const getMembers = async (event: Event & { memberFields: Field[] }, url: URL) => {
	const eventId = event.id

	const data = parseQuery(url, {
		...membersFilterShape,
		skip: z.coerce.number().default(0),
		take: z.coerce.number().default(20),
		summary: z.filter.boolean,
		all: z.filter.boolean,
	})

	const filters: Prisma.MemberWhereInput[] = []
	const subscribesFilters: Prisma.SubscribeWhereInput[] = []

	if (data.search) {
		filters.push({
			user: {
				OR: [
					{ firstName: { contains: data.search } },
					{ lastName: { contains: data.search } },
					{ email: { contains: data.search } },
				],
			},
		})
	}

	if (data.subscribes_teams) {
		subscribesFilters.push({
			state: 'accepted',
			period: { teamId: { in: data.subscribes_teams } },
		})
	}

	if (data.subscribes_range) {
		const { start, end } = data.subscribes_range
		subscribesFilters.push({
			state: 'accepted',
			period: {
				...(start && { end: { gte: start } }),
				...(end && { start: { lte: end } }),
			},
		})
	}

	if (data.leaderOf) {
		filters.push({
			leaderOf: { some: { id: { in: data.leaderOf } } },
		})
	}

	if (data.age) {
		const getDate = (age?: number) => {
			if (age === undefined) return undefined
			return dayjs().subtract(age, 'year').toDate()
		}
		const start = getDate(data.age.max)
		const end = getDate(data.age.min)
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

	if (data.isValidedByEvent !== undefined) {
		filters.push({ isValidedByEvent: data.isValidedByEvent })
	}
	if (data.isValidedByUser !== undefined) {
		filters.push({ isValidedByUser: data.isValidedByUser })
	}
	if (data.isAbsent !== undefined) {
		filters.push({ subscribes: { some: { isAbsent: data.isAbsent } } })
	}

	if (data.role === 'admin') {
		filters.push({ isAdmin: true })
	}
	if (data.role === 'leader') {
		filters.push({ leaderOf: { some: { eventId } } })
	}
	if (data.role === 'member' || subscribesFilters.length) {
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
		data.subscribes_count !== undefined ||
		data.subscribes_hours !== undefined ||
		data.isUserProfileCompleted !== undefined

	const paginationEnable = !data.summary && !data.all && !filterOnComputedValues

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
			skip: paginationEnable ? data.skip : undefined,
			take: paginationEnable ? data.take : undefined,
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

		if (data.subscribes_count) {
			const { min, max } = data.subscribes_count
			if (min !== undefined)
				conditions.push((m) => min <= m.subscribes.filter((s) => s.state === 'accepted').length)
			if (max !== undefined)
				conditions.push((m) => max >= m.subscribes.filter((s) => s.state === 'accepted').length)
		}

		if (data.subscribes_hours) {
			const { min, max } = data.subscribes_hours

			const toHours = (ms: number) => ms / (1000 * 60 * 60)
			if (min !== undefined) conditions.push((m) => min <= toHours(m.workTime))
			if (max !== undefined) conditions.push((m) => max >= toHours(m.workTime))
		}

		if (data.isUserProfileCompleted === true) {
			conditions.push((m) => m.isMemberProfileCompleted && m.isUserProfileCompleted)
		}
		if (data.isUserProfileCompleted === false) {
			conditions.push((m) => !m.isMemberProfileCompleted || !m.isUserProfileCompleted)
		}

		members = members.filter((member) => {
			for (const condition of conditions) {
				if (!condition(member)) return false
			}
			return true
		})
	}

	if (!data.summary) {
		if (!data.all && !paginationEnable)
			return { members: members.slice(data.skip, data.skip + data.take) }
		else return { members }
	}

	const fields = await prisma.field.findMany({ where: { eventId }, orderBy: { position: 'asc' } })
	const periodsMap = new Map<string, Period>()
	members.forEach(({ subscribes }) => {
		subscribes.forEach(({ period }) => {
			periodsMap.set(period.id, period)
		})
	})
	const periods = Array.from(periodsMap.values())

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
