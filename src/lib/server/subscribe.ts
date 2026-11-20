import type { Prisma } from '@prisma/client'
import { subscribeNotification } from '#lib/email/subscribeNotification.js'
import { prisma } from './prisma'
import { isRequestHeld } from '#lib/event/eventAccess.js'

/** Le membre pour lui écrire, les responsables pour répondre, le propriétaire à défaut. */
export const includeForRequestNotification = {
	member: true,
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
	authorName: string
) {
	const memberMail =
		subscribe.member.isNotifiedSubscribe && subscribe.member.email ? [subscribe.member.email] : []
	const leadersMail = subscribe.period.team.leaders.map(({ email }) => email as string)
	if (leadersMail.length === 0) {
		leadersMail.push(subscribe.period.team.event.owner.email)
	}
	const to = subscribe.createdBy === 'user' ? leadersMail : memberMail
	const replyTo = subscribe.createdBy === 'user' ? memberMail : leadersMail
	if (!to.length) return

	await subscribeNotification.request({
		from: subscribe.period.team.event.name,
		to,
		replyTo,
		subject: 'Nouvelle inscription',
		props: { subscribe, authorName },
	})
}

/**
 * L'envoi de la demande d'inscription, s'il a lieu d'être: tant que le membre ne peut pas y
 * répondre, elle attend `sendPendingSubscribeRequests`. Le marqueur est posé avant l'envoi, comme
 * `remindedAt`: deux relâches concurrentes n'envoient qu'une fois. Rend `true` si l'envoi est parti.
 */
export async function notifySubscribeRequest(
	subscribe: SubscribeForRequestNotification,
	authorName: string
): Promise<boolean> {
	const { team } = subscribe.period
	if (isRequestHeld(team.event.state, team.state)) return false
	const { count } = await prisma.subscribe.updateMany({
		where: { id: subscribe.id, notifiedAt: null },
		data: { notifiedAt: new Date() },
	})
	if (!count) return false
	await sendSubscribeRequestNotification(subscribe, authorName).catch(console.error)
	return true
}

/**
 * Les demandes qu'un responsable a créées pendant que le secteur était en brouillon, ou que
 * l'évènement n'était pas publié: c'est en quittant cet état qu'elles partent. Seules celles encore
 * sans réponse sont concernées, une inscription confirmée n'a rien à recevoir. Un envoi qui
 * tombe n'arrête ni les autres, ni la transition. Rend le nombre de demandes envoyées.
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
		if (await notifySubscribeRequest(subscribe, authorName)) sent++
	}
	return sent
}

/** Ce que la publication de l'évènement enverra, hors des secteurs encore en brouillon. */
export function countPendingSubscribeRequests(eventId: string) {
	return prisma.subscribe.count({ where: pendingRequests({ eventId }) })
}

const pendingRequests = (team: Prisma.TeamWhereInput) =>
	({
		period: { team: { ...team, state: { not: 'draft' } } },
		state: 'request',
		createdBy: 'leader',
		notifiedAt: null,
	}) satisfies Prisma.SubscribeWhereInput
