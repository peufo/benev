import { error } from '@sveltejs/kit'
import { isFreeRange } from 'perod'
import { parseFormData, tryOrFail } from 'fuma/server'
import { modelSubscribe } from '$lib/models'
import { generateToken, permission, prisma } from '$lib/server'
import { isMemberAllowed } from '$lib/member'
import { subscribeNotification } from '$lib/email/subscribeNotification'

export const actions = {
	subscribe_create: async ({ request, locals, params: { eventId } }) => {
		const session = await locals.auth.validate()
		if (!session) error(401)
		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelSubscribe)
			const [period, memberAuthor, memberInvited] = await Promise.all([
				prisma.period.findUniqueOrThrow({
					where: { id: data.periodId },
					include: {
						subscribes: { where: { state: { in: ['accepted', 'request'] } } },
						team: { select: { closeSubscribing: true, conditions: true } },
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
			if (period.maxSubscribe <= period.subscribes.length) {
				error(403, 'Sorry, this period is already complet')
			}

			// Check if author as the right to create this subscribe
			const isLeaderOfTeam = await permission
				.leaderOfTeam(period.teamId, locals)
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

			const isAutoAccepted =
				isLeaderOfTeam && (isSelfSubscribe || memberInvited.user.isHeadlessAccount)

			const subscribe = await prisma.subscribe.create({
				data: {
					...data,
					state: isAutoAccepted ? 'accepted' : 'request',
					createdBy: isSelfSubscribe ? 'user' : 'leader',
				},
				include: {
					member: { include: { user: true } },
					period: {
						include: {
							team: {
								include: {
									event: true,
									leaders: { include: { user: true } },
								},
							},
						},
					},
				},
			})

			if (isLeaderOfTeam && isSelfSubscribe) return

			const memberMail = subscribe.member.isNotifiedSubscribe ? [subscribe.member.user.email] : []
			const leadersMail = subscribe.period.team.leaders.map(({ user }) => user.email)
			const to = subscribe.createdBy === 'user' ? leadersMail : memberMail
			const replyTo = subscribe.createdBy === 'user' ? memberMail : leadersMail

			let tokenId: string | undefined = undefined
			if (subscribe.createdBy == 'leader') {
				const isActiveAccount = await prisma.key.count({
					where: {
						user_id: subscribe.member.userId,
						OR: [
							{
								id: { startsWith: 'email:' },
								hashed_password: { not: null },
							},
							{
								id: { not: { startsWith: 'email:' } },
							},
						],
					},
				})
				if (!isActiveAccount) {
					tokenId = await generateToken(
						'passwordReset',
						subscribe.member.userId,
						new Date().getTime() + 1000 * 60 * 60 * 24 * 7
					)
				}
			}

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
							tokenId,
						},
					})
					.catch(console.error)
		})
	},
}
