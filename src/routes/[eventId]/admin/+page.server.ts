import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ params, url }) => {
	const _start = url.searchParams.get('start')
	const _end = url.searchParams.get('end')
	const _teams = url.searchParams.get('teams')
	const memberType = url.searchParams.get('member_type')

	const { eventId } = params

	let periodWhere: Prisma.PeriodWhereInput = {}
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

	const teamWhere: Prisma.TeamWhereInput = { eventId }
	if (typeof _teams === 'string') {
		try {
			const teams = JSON.parse(_teams) as string[]
			teamWhere.id = { in: teams }
		} catch {
			throw error(400, '"teams is not a valid JSON of type string[]')
		}
	}

	const allMember = !memberType || memberType === 'all'
	const OR: Prisma.MemberWhereInput[] = []

	if (allMember || memberType === 'volunteers')
		OR.push({
			subscribes: {
				some: {
					period: {
						team: teamWhere,
						...periodWhere,
					},
				},
			},
		})

	if (allMember || memberType === 'leaders')
		OR.push({
			leaderOf: {
				some: {
					periods: {
						some: {
							team: teamWhere,
							...periodWhere,
						},
					},
				},
			},
		})

	return {
		members: await prisma.member.findMany({
			where: { OR },
			include: {
				user: true,
				leaderOf: true,
				subscribes: {
					where: {
						period: {
							team: teamWhere,
							...periodWhere,
						},
					},
					include: { period: true },
				},
			},
		}),
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
		}),
	}
}
