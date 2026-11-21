import type { Prisma } from '@prisma/client'
import { MAX_IMPORT_INVITES } from '#lib/member/import/buildMembers.js'
import { createRateLimit } from './rateLimit'
import { sendHeldInvite } from './invite'
import { prisma } from './prisma'

// Les invitations en nombre: un import, ou celles qu'un évènement retenait jusqu'à sa publication.
// À importer par son chemin, jamais du barrel `#lib/server`: le plafond se crée à l'évaluation du
// module (voir `createRateLimit`).

/**
 * Un import peut viser n'importe quelle adresse: sans plafond, un compte malveillant ferait de nous
 * un relais de spam, et la réputation de l'expéditeur est commune à tous les évènements. La
 * publication puise dans le même: c'est le même compte qui a choisi ces adresses.
 */
export const isInviteLimited = createRateLimit({
	windowMs: 24 * 60 * 60 * 1000,
	max: MAX_IMPORT_INVITES,
})

type Inviter = { userId: string; firstName: string; lastName: string; email: string }

/** Sans compte relié ni adresse, une invitation n'a plus personne à atteindre. */
const pendingInvites = (eventId: string) =>
	({
		eventId,
		invitePendingAt: { not: null },
		userId: null,
		email: { not: null },
	}) satisfies Prisma.MemberWhereInput

/**
 * Envoie les invitations que l'évènement retenait. Ce que le plafond (`limited`) ou la file
 * (`refused`) refuse reste en attente, et part à la prochaine publication ou depuis la fiche du
 * membre: l'organisateur·ice n'y fait pas la même chose, d'où deux comptes.
 */
export async function sendPendingInvites(eventId: string, author: Inviter) {
	const members = await prisma.member.findMany({
		where: pendingInvites(eventId),
		include: { event: { select: { name: true } } },
		orderBy: { invitePendingAt: 'asc' },
	})
	let sent = 0
	let limited = 0
	let refused = 0
	for (const [index, member] of members.entries()) {
		if (isInviteLimited(author.userId)) {
			limited = members.length - index
			break
		}
		const outcome = await sendHeldInvite(member, author, { bulk: true })
		if (outcome === 'sent') sent++
		else isInviteLimited.refund(author.userId)
		if (outcome === 'refused') refused++
	}
	return { sent, limited, refused }
}

/**
 * Publier sans inviter: le choix est fait, la fiche de chaque membre garde le renvoi. Rend le
 * nombre d'invitations qui seraient parties, celui que la publication annonçait et que le journal
 * doit dire; le marqueur s'efface aussi des fiches qui n'avaient plus personne à atteindre.
 */
export async function clearPendingInvites(eventId: string) {
	const [declined] = await prisma.$transaction([
		prisma.member.count({ where: pendingInvites(eventId) }),
		prisma.member.updateMany({
			where: { eventId, invitePendingAt: { not: null } },
			data: { invitePendingAt: null },
		}),
	])
	return declined
}

/** Le compte que la publication proposera d'envoyer. */
export function countPendingInvites(eventId: string) {
	return prisma.member.count({ where: pendingInvites(eventId) })
}
