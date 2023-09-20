import { error } from '@sveltejs/kit'
import { SubscribeState } from '@prisma/client'
import { Action } from './$types'
import { isLeaderOrThrow, prisma, sendEmailTemplate, tryOrFail } from '$lib/server'
import { EmailNewSubscribe, EmailSubscribeState, EmailSubscribeStateCancelled } from '$lib/email'
import { Session } from 'lucia'

const setSubscribState: (state: SubscribeState) => Action =
	(state) =>
	({ locals, params: { subscribeId } }) => {
		return tryOrFail(async () => {
			const _subscribe = await prisma.subscribe.findUniqueOrThrow({
				where: { id: subscribeId },
				include: { period: true, member: true },
			})

			type Edtions = Record<SubscribeState, SubscribeState[]>
			const creatorEditions: Edtions = {
				request: ['cancelled'],
				accepted: ['cancelled'],
				denied: ['cancelled'],
				cancelled: ['request'],
			}
			const subscriberEditions: Edtions = {
				request: ['accepted', 'denied'],
				accepted: ['denied'],
				denied: ['accepted'],
				cancelled: [],
			}
			const isCreatorEdition = creatorEditions[_subscribe.state].includes(state)
			const isSubscriberEdition = subscriberEditions[_subscribe.state].includes(state)
			if (!isCreatorEdition && !isSubscriberEdition) throw error(401)

			const isLeaderRequired = (_subscribe.createdBy === 'leader') === isCreatorEdition
			let session: Session | null
			if (isLeaderRequired) {
				session = await isLeaderOrThrow(_subscribe.period.teamId, locals)
			} else {
				session = await locals.auth.validate()
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

			const toMember = [subscribe.member.user.email]
			const toLeaders = subscribe.period.team.leaders.map((l) => l.user.email)
			const to = isLeaderRequired ? toMember : toLeaders

			if (to.length) {
				switch (state) {
					case 'cancelled':
						await sendEmailTemplate(EmailSubscribeStateCancelled, {
							from: subscribe.period.team.event.name,
							to,
							subject: `Inscription annulée`,
							props: { subscribe },
						})
						break
					case 'request':
						await sendEmailTemplate(EmailNewSubscribe, {
							from: subscribe.period.team.event.name,
							to,
							subject: 'Nouvelle inscription',
							props: { subscribe, author: session.user },
						})
						break

					default:
						await sendEmailTemplate(EmailSubscribeState, {
							from: subscribe.period.team.event.name,
							to,
							subject: `Inscription ${subscribe.state === 'accepted' ? 'confirmée' : 'refusée'}`,
							props: { subscribe },
						})
				}
			}
		})
	}

export const actions = {
	subscribe_accepted: setSubscribState('accepted'),
	subscribe_denied: setSubscribState('denied'),
	subscribe_cancelled: setSubscribState('cancelled'),
	subscribe_request: setSubscribState('request'),
}
