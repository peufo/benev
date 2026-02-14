import { error } from '@sveltejs/kit'
import { isFreeRange } from 'perod'
import { formAction } from 'fuma/server'
import { modelSubscribe } from '$lib/models'
import { permission, prisma } from '$lib/server'
import { isMemberAllowed } from '$lib/member'
import { subscribeNotification } from '$lib/email/subscribeNotification'
import { periodIsComplet } from '$lib/period/index.js'

export const actions = {
	subscribe_create: formAction(modelSubscribe, async ({ data, event }) => {
		const session = await event.locals.auth.validate()
		if (!session) error(401)
		const { eventId } = event.params

		const [period, memberAuthor, memberInvited] = await Promise.all([
			prisma.period.findUniqueOrThrow({
				where: { id: data.periodId },
				include: {
					subscribes: { where: { state: { in: ['accepted', 'request'] } } },
					team: { select: { closeSubscribing: true, conditions: true, overflowPermitted: true } },
				},
			}),
			prisma.member.findUniqueOrThrow({
				where: { userId_eventId: { userId: session.user.id, eventId } },
				include: { event: true, user: true },
			}),
			prisma.member.findUniqueOrThrow({
				where: { id: data.memberId },
				include: {
					user: true,
					subscribes: {
						where: { state: { in: ['accepted', 'request'] } },
						include: { period: true },
					},
				},
			}),
		])

		// Check if the period is already complet
		if (periodIsComplet(period)) {
			error(403, 'Sorry, this period is already complet')
		}

		// Check if author as the right to create this subscribe
		const isLeaderOfTeam = await permission
			.leaderOfTeam(period.teamId, event.locals)
			.then(() => true)
			.catch(() => false)
		const isSelfSubscribe = data.memberId === memberAuthor.id
		if (!isLeaderOfTeam && !isSelfSubscribe) error(403)

		// Check if self subscribe conditions is respected
		if (!isLeaderOfTeam) {
			if (!memberAuthor.event.selfSubscribeAllowed) error(403)
			const closeSubscribing = period.team.closeSubscribing || memberAuthor.event.closeSubscribing
			const DAY = 1000 * 60 * 60 * 24
			if (closeSubscribing && closeSubscribing.getTime() < new Date().getTime() - DAY) error(403)
			if (!isMemberAllowed(period.team.conditions, memberAuthor)) error(403)
		}

		// Check if member is free in this period
		const isMemberBusy = !isFreeRange(
			period,
			memberInvited.subscribes.map((sub) => sub.period),
			memberAuthor.event.overlapPeriodAllowed * (1000 * 60)
		)
		if (isMemberBusy) {
			const startMessage = isSelfSubscribe ? 'Tu es' : 'Ce membre est'
			error(403, `${startMessage} déjà occupé durant cette période`)
		}

		const isAutoAccepted = isLeaderOfTeam && (isSelfSubscribe || !memberInvited.userId)

		const subscribe = await prisma.subscribe.create({
			data: {
				...data,
				state: isAutoAccepted ? 'accepted' : 'request',
				createdBy: isSelfSubscribe ? 'user' : 'leader',
			},
			include: {
				member: true,
				period: {
					include: {
						team: {
							include: {
								event: true,
								leaders: true,
							},
						},
					},
				},
			},
		})

		if (isLeaderOfTeam && isSelfSubscribe) return

		const memberMail =
			subscribe.member.isNotifiedSubscribe && subscribe.member.email ? [subscribe.member.email] : []
		const leadersMail = subscribe.period.team.leaders.map(({ email }) => email as string)
		const to = subscribe.createdBy === 'user' ? leadersMail : memberMail
		const replyTo = subscribe.createdBy === 'user' ? memberMail : leadersMail

		if (to.length)
			await subscribeNotification
				.request({
					from: subscribe.period.team.event.name,
					to,
					replyTo,
					subject: 'Nouvelle inscription',
					props: {
						subscribe,
						authorName: `${session.user.firstName} ${session.user.lastName}`,
					},
				})
				.catch(console.error)
	}),
}
