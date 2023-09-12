import { SubscribeState } from '@prisma/client'
import { isLeaderOrThrow, prisma, sendEmailTemplate, tryOrFail } from '$lib/server'
import { EmailSubscribeState } from '$lib/email'
import { Action } from './$types'

const setSubscribState: (state: SubscribeState) => Action =
	(state) =>
	({ locals, params: { subscribeId } }) => {
		return tryOrFail(async () => {
			const { period } = await prisma.subscribe.findUniqueOrThrow({
				where: { id: subscribeId },
				include: { period: true },
			})
			await isLeaderOrThrow(period.teamId, locals)

			const subscribe = await prisma.subscribe.update({
				where: { id: subscribeId },
				data: { state },
				include: {
					member: { include: { user: true } },
					period: {
						include: {
							team: {
								include: {
									event: true,
									leaders: { select: { user: { select: { email: true } } } },
								},
							},
						},
					},
				},
			})

			const to =
				subscribe.createdBy === 'user'
					? [subscribe.member.user.email]
					: subscribe.period.team.leaders.map((l) => l.user.email)

			if (to.length) {
				await sendEmailTemplate(EmailSubscribeState, {
					from: subscribe.period.team.event.name,
					to,
					subject: `Inscription ${subscribe.state === 'accepted' ? 'confirmée' : 'refusée'}`,
					props: { subscribe },
				})
			}
		})
	}

export const actions = {
	subscribe_accepted: setSubscribState('accepted'),
	subscribe_denied: setSubscribState('denied'),
}
