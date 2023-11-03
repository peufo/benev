import { error } from '@sveltejs/kit'
import { Prisma, SubscribeState } from '@prisma/client'
import { Action } from './$types'
import { prisma, sendEmailTemplate, tryOrFail, permission, type MemberWithRole } from '$lib/server'
import { EmailNewSubscribe, EmailSubscribeState, EmailSubscribeStateCancelled } from '$lib/email'
import { isFreeRange } from 'perod'

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

const setSubscribState: (state: SubscribeState) => Action =
	(state) =>
	({ locals, params: { eventId, subscribeId } }) => {
		return tryOrFail(async () => {
			const whereSubscribe: Prisma.SubscribeWhereInput = {
				id: { not: subscribeId },
				state: { in: ['accepted', 'request'] },
			}

			const _subscribe = await prisma.subscribe.findUniqueOrThrow({
				where: { id: subscribeId },
				include: {
					member: {
						include: {
							subscribes: {
								where: whereSubscribe,
								include: { period: true },
							},
						},
					},
					period: {
						include: {
							subscribes: {
								where: whereSubscribe,
							},
						},
					},
				},
			})

			const isCreatorEdition = creatorEditions[_subscribe.state].includes(state)
			const isSubscriberEdition = subscriberEditions[_subscribe.state].includes(state)
			if (!isCreatorEdition && !isSubscriberEdition) throw error(403)

			// Check if author right
			const isLeaderAction = (_subscribe.createdBy === 'leader') === isCreatorEdition
			let author: MemberWithRole | null
			if (isLeaderAction) {
				author = await permission.leader(eventId, locals)
				const isInLeaderTeams = author.leaderOf.find(({ id }) => id === _subscribe.period.teamId)
				if (author.role === 'leader' && !isInLeaderTeams) throw error(403)
			} else {
				author = await permission.member(eventId, locals)
				if (author.id !== _subscribe.memberId) throw error(403)
			}

			if (state === 'accepted' || state === 'request') {
				// Check if the period is already complet
				const { subscribes, maxSubscribe } = _subscribe.period
				if (maxSubscribe <= subscribes.length) {
					throw error(403, 'Sorry, this period is already complet')
				}

				// Check if member is free in this period
				const memberPeriods = _subscribe.member.subscribes.map((sub) => sub.period)
				if (!isFreeRange(_subscribe.period, memberPeriods)) {
					throw error(403, `Already busy during this period`)
				}
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

			const toMember = subscribe.member.user.wantsNotification ? [subscribe.member.user.email] : []
			const toLeaders = subscribe.period.team.leaders.map((l) => l.user.email)
			const to = isLeaderAction ? toMember : toLeaders

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
							props: { subscribe, author: author.user },
						})
						break

					default:
						await sendEmailTemplate(EmailSubscribeState, {
							from: subscribe.period.team.event.name,
							to,
							subject: `Inscription ${subscribe.state === 'accepted' ? 'confirmée' : 'déclinée'}`,
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
