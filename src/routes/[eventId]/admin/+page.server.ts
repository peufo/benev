import { prisma } from '$lib/server'

export const load = async ({ params, url }) => {
	const start = url.searchParams.get('start')
	const end = url.searchParams.get('end')
	const teams = url.searchParams.get('teams')
	console.log({ start, end, teams })

	const { eventId } = params

	return {
		periods: await prisma.period.findMany({
			where: { team: { eventId } },
		}),
		users: await prisma.user.findMany({
			where: { subscribes: { some: { period: { team: { eventId } } } } },
			include: {
				subscribes: true,
			},
		}),
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
		}),
	}
}
