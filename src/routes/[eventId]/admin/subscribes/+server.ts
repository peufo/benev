import { getSubscribes } from './getSubscribes'
import { prisma, json } from '$lib/server'

export const GET = async ({ url, params: { eventId } }) => {
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})
	const result = await getSubscribes(event, url)
	return json(result)
}
