import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ params, url }) => {
	const search = url.searchParams.get('search')
	const _start = url.searchParams.get('start')
	const _end = url.searchParams.get('end')
	const _teams = url.searchParams.get('teams')
	const memberType = url.searchParams.get('member_type')

	const { eventId } = params

	const where: Prisma.MemberWhereInput = { eventId, OR: [] }
	const teamWhere: Prisma.TeamWhereInput = { eventId }
	let periodWhere: Prisma.PeriodWhereInput | undefined = undefined

	if (typeof _start === 'string' && typeof _end === 'string') {
		const start = new Date(_start)
		const end = new Date(_end)
		if (isNaN(start.getTime()) || isNaN(end.getTime()))
			throw error(400, '"start" and "end" are not a valid date')
		periodWhere = {
			start: { lte: end },
			end: { gte: start },
		}
	}

	if (typeof _teams === 'string') {
		try {
			const teams = JSON.parse(_teams) as string[]
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

	const allMember = !memberType || memberType === 'all'
	const subscribesFilter = !allMember || _start || _end || _teams

	if (subscribesFilter) {
		if (allMember || memberType === 'volunteers')
			where.OR!.push({
				subscribes: {
					some: subscribeWhere,
				},
			})
		if (allMember || memberType === 'leaders')
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

	if (search)
		where.user = {
			OR: [
				{ firstName: { contains: search } },
				{ lastName: { contains: search } },
				{ email: { contains: search } },
			],
		}

	if (!where.OR?.length) delete where.OR

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
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
		}),
		fields: await prisma.field.findMany({
			where: { eventId },
		}),
		periods: await prisma.period.findMany({
			where: { ...periodWhere, team: { eventId, ...teamWhere } },
		}),
	}
}
