import { permission, prisma } from '$lib/server'

export const load = async ({ locals, params: { eventId } }) => {
	await permission.admin(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: {
			teams: {
				include: { periods: true },
			},
			memberFields: true,
			pages: true,
			views: true,
		},
	})
	return { event }
}
