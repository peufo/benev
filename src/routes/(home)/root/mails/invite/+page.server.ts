import { getMemberProfile, prisma, renderEmailModel } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async () => {
	const jonas = await prisma.member.findFirst({ where: { user: { firstName: 'Jonas' } } })
	if (!jonas) error(404)
	const member = await getMemberProfile({ id: jonas.id })
	return {
		member,
		emailInvitation: await renderEmailModel(member.eventId, 'invitation_create', {
			member,
			authorName: 'Magicarp',
			tokenId: 'prout',
		}),
		emailInvitationAccept: await renderEmailModel(member.eventId, 'invitation_accept', { member }),
	}
}
