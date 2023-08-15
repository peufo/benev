import { prisma } from '$lib/server'

export const load = async ({ params, url }) => {
	const start = url.searchParams.get('start')
	const end = url.searchParams.get('end')
	console.log({ start, end })

	return {
		periods: await prisma.period.findMany({
			where: { team: { eventId: params.eventId } },
		}),
		users: await prisma.user.findMany({
			where: { subscribes: { some: { period: { team: { eventId: params.eventId } } } } },
			include: {
				subscribes: true,
			},
		}),
	}
}
