import type { Prisma } from '@prisma/client'
import { subscribeNotification } from '$lib/email/subscribeNotification'
import { prisma } from './prisma'

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
 * Les demandes qu'un responsable a créées pendant que le secteur était en brouillon n'ont
 * jamais été envoyées: c'est en quittant le brouillon qu'elles partent. Seules celles encore
 * sans réponse sont concernées, une inscription confirmée n'a rien à recevoir. Un envoi qui
 * tombe n'arrête ni les autres, ni la transition.
 */
export async function sendPendingSubscribeRequests(teamId: string, authorName: string) {
	const subscribes = await prisma.subscribe.findMany({
		where: { period: { teamId }, state: 'request', createdBy: 'leader' },
		include: includeForRequestNotification,
	})
	for (const subscribe of subscribes) {
		await sendSubscribeRequestNotification(subscribe, authorName).catch(console.error)
	}
}
