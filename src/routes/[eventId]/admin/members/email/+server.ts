import { getMembers } from '../getMembers'
import { prisma, json, permission } from '$lib/server'

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})
	url.searchParams.set('all', 'true')
	const { members } = await getMembers(event, url)
	return json({ emails: members.map((m) => m.email).filter(Boolean) as string[] })
}
