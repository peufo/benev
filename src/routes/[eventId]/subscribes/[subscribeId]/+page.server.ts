import { SubscribeState } from '@prisma/client'
import { isLeaderOrThrow, prisma, sendEmailTemplate, tryOrFail } from '$lib/server'
import { EmailSubscribeState } from '$lib/email'
import { Action } from './$types'
import { error } from '@sveltejs/kit'

const setSubscribState: (state: SubscribeState) => Action =
	(state) =>
	({ locals, params: { subscribeId } }) => {
		return tryOrFail(async () => {
			const _subscribe = await prisma.subscribe.findUniqueOrThrow({
				where: { id: subscribeId },
				include: { period: true, member: true },
			})

			if (_subscribe.createdBy === 'user') await isLeaderOrThrow(_subscribe.period.teamId, locals)
			if (_subscribe.createdBy === 'leader') {
				const session = await locals.auth.validate()
				if (session?.user.id !== _subscribe.member.userId) throw error(401)
			}

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
