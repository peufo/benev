import { json } from '@sveltejs/kit'
import { getSubscribes } from './getSubscribes'
import { prisma } from '$lib/server'

export const GET = async ({ url, params: { eventId } }) => {
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})
	const members = await getSubscribes(event, url)
	return json(members)
}
