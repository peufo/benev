import { getMembers } from '../getMembers'
import { prisma, permission, type MemberWithUser } from '$lib/server'

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})
	const { members } = await getMembers(event, url)
	const cards = members.map(getVCard).join('\n')

	return new Response(cards, {
		headers: {
			'Content-type': 'text/vcard; charset=utf-8',
			'Content-Disposition': 'attachment; filename="members.vcf"',
		},
	})
}

function getVCard(member: MemberWithUser): string {
	return 'prout'
}
