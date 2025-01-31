import { permission, prisma } from '$lib/server'
import { error } from '@sveltejs/kit'
import { z } from 'fuma'
import { formAction } from 'fuma/server'

export const load = async ({ parent, params: { eventId } }) => {
	const { user } = await parent()
	if (!user) error(401)
	const member = await prisma.member.findUniqueOrThrow({
		where: { userId_eventId: { userId: user.id, eventId } },
	})
	if (!member.isAdmin) error(403)
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

const validationEventClone = {
	deltaDays: z.number(),
	pages: z.arrayRaw(z.string()),
	fields: z.arrayRaw(z.string()),
	views: z.arrayRaw(z.string()),
	teams: z.arrayRaw(z.string()),
}

export const actions = {
	event_clone: formAction(validationEventClone, async ({ data, locals, params }) => {
		const member = await permission.admin(params.eventId, locals)
		console.log(data)
		return {}
	}),
}
