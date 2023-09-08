import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ params, url }) => {
	const _start = url.searchParams.get('start')
	const _end = url.searchParams.get('end')
	const _teams = url.searchParams.get('teams')
	const memberType = url.searchParams.get('member_type')

	const { eventId } = params

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
						...periodWhere,
						team: teamWhere,
					},
				},
			},
		})

	if (allMember || memberType === 'leaders')
		OR.push({
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

	return {
		members: await prisma.member.findMany({
			where: {
				eventId,
				...(OR.length && { OR }),
			},
			include: {
				user: {
					select: {
						// TODO: conditional select in terms of isValidedByUser
						email: true,
						phone: true,
						firstName: true,
						lastName: true,
						birthday: true,
					},
				},
				leaderOf: true,
				profile: true,
				subscribes: {
					where: {
						period: periodWhere || {},
					},
					include: { period: true },
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
	}
}
