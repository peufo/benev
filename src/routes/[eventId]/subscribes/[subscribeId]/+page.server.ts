import { error } from '@sveltejs/kit'
import type { Prisma, SubscribeState } from '@prisma/client'
import type { Action } from './$types'
import {
	prisma,
	sendEmailTemplate,
	tryOrFail,
	permission,
	type MemberWithComputedValues,
} from '$lib/server'
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
			if (!isCreatorEdition && !isSubscriberEdition) error(403);

			// Check author permission
			const isLeaderAction = (_subscribe.createdBy === 'leader') === isCreatorEdition
			let author: MemberWithComputedValues | null
			if (isLeaderAction) {
				author = await permission.leader(eventId, locals)
				const isInLeaderTeams = author.leaderOf.find(({ id }) => id === _subscribe.period.teamId)
				if (!author.roles.includes('admin') && !isInLeaderTeams) error(403);
			} else {
				author = await permission.member(eventId, locals)
				if (author.id !== _subscribe.memberId) error(403);
			}

			if (state === 'accepted' || state === 'request') {
				// Check if the period is already complet
				const { subscribes, maxSubscribe } = _subscribe.period
				if (maxSubscribe <= subscribes.length) {
					error(403, 'Sorry, this period is already complet');
				}

				// Check if member is free in this period
				const memberPeriods = _subscribe.member.subscribes.map((sub) => sub.period)
				if (!isFreeRange(_subscribe.period, memberPeriods)) {
					error(403, `Already busy during this period`);
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
			const replyTo = isLeaderAction ? toLeaders : toMember

			if (to.length) {
				switch (state) {
					case 'cancelled':
						await sendEmailTemplate(EmailSubscribeStateCancelled, {
							from: subscribe.period.team.event.name,
							to,
							replyTo,
							subject: `Inscription annulée`,
							props: { subscribe },
						})
						break
					case 'request':
						await sendEmailTemplate(EmailNewSubscribe, {
							from: subscribe.period.team.event.name,
							to,
							replyTo,
							subject: 'Nouvelle inscription',
							props: { subscribe, author: author.user },
						})
						break

					default:
						await sendEmailTemplate(EmailSubscribeState, {
							from: subscribe.period.team.event.name,
							to,
							replyTo,
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
	subscribe_delete: ({ locals, params: { subscribeId } }) =>
		// TODO: un petit mail à l'inscrit ?
		tryOrFail(async () => {
			const subscribe = await prisma.subscribe.findUniqueOrThrow({
				where: { id: subscribeId },
				include: { period: true },
			})
			await permission.leaderOfTeam(subscribe.period.teamId, locals)
			return prisma.subscribe.delete({ where: { id: subscribeId } })
		}),
	subscribe_toggle_isAbsent: async ({ locals, params: { subscribeId } }) =>
		tryOrFail(async () => {
			const subscribe = await prisma.subscribe.findUniqueOrThrow({
				where: { id: subscribeId },
				include: { period: true },
			})
			await permission.leaderOfTeam(subscribe.period.teamId, locals)
			return prisma.subscribe.update({
				where: { id: subscribeId },
				data: {
					isAbsent: !subscribe.isAbsent,
				},
			})
		}),
}
