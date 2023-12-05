import { json } from '@sveltejs/kit'
import { getMembers } from './getMembers'
import { prisma } from '$lib/server'

export const GET = async ({ url, params: { eventId } }) => {
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})
	const res = await getMembers(event, url)
	return json(res)
}
