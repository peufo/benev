import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ params, url }) => {
	const _start = url.searchParams.get('start')
	const _end = url.searchParams.get('end')
	const _teams = url.searchParams.get('teams')

	const { eventId } = params

	let periodWhere: {
		start?: { lte: Date }
		end?: { gte: Date }
	} = {}
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

	const teamWhere: {
		eventId: string
		id?: { in: string[] }
	} = { eventId }
	if (typeof _teams === 'string') {
		try {
			const teams = JSON.parse(_teams) as string[]
			teamWhere.id = { in: teams }
		} catch {
			throw error(400, '"teams is not a valid JSON of type string[]')
		}
	}

	return {
		users: await prisma.user.findMany({
			where: {
				subscribes: {
					some: {
						period: {
							team: teamWhere,
							...periodWhere,
						},
					},
				},
			},
			include: {
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
