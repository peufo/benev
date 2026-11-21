import type { Member, Prisma } from '@prisma/client'
import { subscribeNotification } from '#lib/email/subscribeNotification.js'
import { prisma } from './prisma'
import { isMemberMailHeld } from '#lib/event/eventAccess.js'

/** Ce qui ouvre un évènement fermé, lu sur une fiche brute plutôt que sur `getMemberProfile`. */
export const includeMemberRole = { _count: { select: { leaderOf: true } } } as const

export function memberHasRole(
	member: Pick<Member, 'isAdmin' | 'userId'> & { _count: { leaderOf: number } },
	event: { ownerId: string }
): boolean {
	return member.isAdmin || member._count.leaderOf > 0 || member.userId === event.ownerId
}

/** Le membre pour lui écrire, les responsables pour répondre, le propriétaire à défaut. */
export const includeForRequestNotification = {
	member: { include: includeMemberRole },
	period: {
		include: {
			team: {
				include: {
					leaders: true,
					event: { include: { owner: { select: { email: true } } } },
				},
			},
		},
	},
} satisfies Prisma.SubscribeInclude

export type SubscribeForRequestNotification = Prisma.SubscribeGetPayload<{
	include: typeof includeForRequestNotification
}>

/**
 * Le courriel « Nouvelle inscription »: aux responsables quand le membre s'inscrit, au membre
 * quand un responsable l'inscrit. Sans responsable, le propriétaire reçoit à leur place.
 */
export async function sendSubscribeRequestNotification(
	subscribe: SubscribeForRequestNotification,
	authorName: string,
	{ bulk = false } = {}
): Promise<'sent' | 'nobody' | 'refused'> {
	const memberMail =
		subscribe.member.isNotifiedSubscribe && subscribe.member.email ? [subscribe.member.email] : []
	const leadersMail = subscribe.period.team.leaders.map(({ email }) => email as string)
	if (leadersMail.length === 0) {
		leadersMail.push(subscribe.period.team.event.owner.email)
	}
	const to = subscribe.createdBy === 'user' ? leadersMail : memberMail
	const replyTo = subscribe.createdBy === 'user' ? memberMail : leadersMail
	if (!to.length) return 'nobody'

	const queued = await subscribeNotification.request({
		from: subscribe.period.team.event.name,
		to,
		replyTo,
		subject: 'Nouvelle inscription',
		props: { subscribe, authorName },
		bulk,
	})
	return queued ? 'sent' : 'refused'
}

/**
 * L'envoi de la demande d'inscription, s'il a lieu d'être: tant que son destinataire ne peut pas
 * y répondre, elle attend `sendPendingSubscribeRequests`. Le marqueur est posé avant l'envoi, comme
 * `remindedAt`: deux relâches concurrentes n'envoient qu'une fois. Un message que la file refuse
 * rend son marqueur, et la demande reste en attente de la prochaine relâche. Rend `true` si un
 * e-mail est parti.
 */
export async function notifySubscribeRequest(
	subscribe: SubscribeForRequestNotification,
	authorName: string,
	{ bulk = false } = {}
): Promise<boolean> {
	const { team } = subscribe.period
	const hasRole = subscribe.createdBy === 'user' || memberHasRole(subscribe.member, team.event)
	if (isMemberMailHeld(team.event.state, team.state, { hasRole })) return false
	const { count } = await prisma.subscribe.updateMany({
		where: { id: subscribe.id, notifiedAt: null },
		data: { notifiedAt: new Date() },
	})
	if (!count) return false
	const outcome = await sendSubscribeRequestNotification(subscribe, authorName, { bulk }).catch(
		(err) => {
			console.error(err)
			return 'refused' as const
		}
	)
	if (outcome === 'refused')
		await prisma.subscribe.update({ where: { id: subscribe.id }, data: { notifiedAt: null } })
	return outcome === 'sent'
}

/**
 * Les demandes qu'un responsable a créées pendant que le secteur était en brouillon, ou que
 * l'évènement n'était pas publié: c'est en quittant cet état qu'elles partent. Seules celles encore
 * sans réponse sont concernées, une inscription confirmée n'a rien à recevoir. Elles partent en
 * masse, derrière les e-mails urgents. Un envoi qui tombe n'arrête ni les autres, ni la
 * transition. Rend le nombre d'e-mails partis.
 */
export async function sendPendingSubscribeRequests(
	scope: { teamId: string } | { eventId: string },
	authorName: string
): Promise<number> {
	const team = 'teamId' in scope ? { id: scope.teamId } : { eventId: scope.eventId }
	const subscribes = await prisma.subscribe.findMany({
		where: pendingRequests({ ...team, event: { state: 'published' } }),
		include: includeForRequestNotification,
	})
	let sent = 0
	for (const subscribe of subscribes) {
		if (await notifySubscribeRequest(subscribe, authorName, { bulk: true })) sent++
	}
	return sent
}

/** Ce que la publication de l'évènement enverra, hors des secteurs encore en brouillon. */
export function countPendingSubscribeRequests(eventId: string) {
	return prisma.subscribe.count({ where: pendingRequests({ eventId }) })
}

/**
 * Une proposition de responsable s'adresse au membre: sans adresse ou sans notification, elle n'a
 * personne à qui partir, et l'annoncer à la publication promettrait un e-mail qui n'existe pas. Le
 * filtre reprend celui de `sendSubscribeRequestNotification`.
 */
const pendingRequests = (team: Prisma.TeamWhereInput) =>
	({
		period: { team: { ...team, state: { not: 'draft' } } },
		state: 'request',
		createdBy: 'leader',
		notifiedAt: null,
		member: { email: { not: null }, isNotifiedSubscribe: true },
	}) satisfies Prisma.SubscribeWhereInput
