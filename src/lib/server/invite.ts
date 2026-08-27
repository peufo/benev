import { sendEmailModel } from './email'
import { getMemberProfile } from './member'

type InvitedMember = { id: string; eventId: string; email: string; event: { name: string } }
type Inviter = { firstName: string; lastName: string; email: string }

/**
 * L'email d'invitation. Deux gestes l'envoient: la création du membre, et le renvoi depuis sa
 * fiche — typiquement quand l'adresse vient d'être corrigée.
 */
export async function sendInviteEmail(member: InvitedMember, author: Inviter) {
	await sendEmailModel(member.eventId, 'invitation_create', {
		from: member.event.name,
		to: member.email,
		replyTo: author.email,
		subject: 'Invitation',
		props: {
			authorName: `${author.firstName} ${author.lastName}`,
			member: await getMemberProfile({ id: member.id }),
		},
		// Un échec d'envoi atterrit ainsi sur la fiche de l'invité, et pas seulement dans le
		// journal de l'évènement: « l'invitation n'est jamais arrivée » est le cas numéro un.
		logContext: { memberId: member.id },
	})
}
