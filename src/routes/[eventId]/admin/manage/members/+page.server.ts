import { error } from '@sveltejs/kit'
import z from 'zod'
import type { Prisma } from '@prisma/client'
import { parseQuery, prisma } from '$lib/server'

export const load = async ({ url, params: { eventId } }) => {
	const { query, err } = parseQuery(
		url,
		z.object({
			search: z.string(),
			start: z.coerce.date(),
			end: z.coerce.date(),
			teams: z.string(),
			memberType: z.string(),
			fieldId: z.string(),
			fieldValue: z.string(),
		})
	)
	if (err) return err

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

	return {
		members: await prisma.member.findMany({
			where,
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
		}),
		periods: await prisma.period.findMany({
			where: { ...periodWhere, team: { eventId, ...teamWhere } },
		}),
	}
}
