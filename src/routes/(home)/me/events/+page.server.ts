import { getInvitedMember } from '$lib/server'
import { getEventMembers, partitionEventMembers } from './events.server'

export const load = async ({ parent, cookies }) => {
	const { user } = await parent()
	const { invitations, upcoming, undated, past } = partitionEventMembers(
		await getEventMembers(user)
	)

	// Reprendre une fiche invitée demande d'avoir prouvé son adresse. Le jeton du mail en tient
	// lieu: l'invitation qu'il désigne reste ouverte, et n'appelle donc pas la vérification.
	const invited = user.isEmailVerified ? null : await getInvitedMember(cookies)
	const emailToVerify =
		!user.isEmailVerified && invitations.some(({ id }) => id !== invited?.id) ? user.email : null

	// Les évènements terminés vivent sur `/me/events/past`: ici on n'en garde que le
	// compte, qui sert de libellé au bouton d'accès.
	return { invitations, upcoming, undated, nbPast: past.length, emailToVerify }
}
