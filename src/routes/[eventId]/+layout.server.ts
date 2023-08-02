import { prisma } from '$lib/server'

export const load = async ({ params }) => {
	const event = await prisma.event.findUniqueOrThrow({ where: { id: params.eventId } })

	return { event }
}
