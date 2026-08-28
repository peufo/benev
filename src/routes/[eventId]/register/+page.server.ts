import { isSameEmail, prisma } from '$lib/server'
import { NOINDEX_FOLLOW } from '$lib/seo'

export const load = async ({ parent, params: { eventId } }) => {
	const { user, invite } = await parent()

	// Le lien d'invitation a été suivi depuis une session ouverte sur une autre adresse. Le tunnel
	// ne peut rien en faire: l'adhésion se rattache par email, ce compte-ci ne retrouvera jamais le
	// membre invité. Le cookie vit 24 h et peut désigner un autre évènement que celui-ci, d'où la
	// comparaison des deux.
	const inviteMismatch =
		user && invite?.eventId === eventId && !isSameEmail(invite.email, user.email)
			? { eventName: invite.eventName, invitedEmail: invite.email, currentEmail: user.email }
			: null

	return {
		inviteMismatch,
		charter: await prisma.page.findFirst({ where: { eventId, type: 'charter' } }),
		metaTags: NOINDEX_FOLLOW,
	}
}
