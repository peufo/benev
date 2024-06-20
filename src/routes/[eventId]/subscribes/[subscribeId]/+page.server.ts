import { error } from '@sveltejs/kit'
import type { Prisma, SubscribeState } from '@prisma/client'
import { isFreeRange } from 'perod'
import type { Action } from './$types'
import { tryOrFail } from 'fuma/server'
import {
	prisma,
	permission,
	ensureLicenceMembers,
	type MemberWithComputedValues,
} from '$lib/server'
import { subscribeNotification } from '$lib/email/subscribeNotification'

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
			if (!isCreatorEdition && !isSubscriberEdition) error(403)

			// Check author permission
			const isLeaderAction = (_subscribe.createdBy === 'leader') === isCreatorEdition

			let author: MemberWithComputedValues | null
			if (isLeaderAction) {
				author = await permission.leader(eventId, locals)
				const isInLeaderTeams = author.leaderOf.find(({ id }) => id === _subscribe.period.teamId)
				if (!author.roles.includes('admin') && !isInLeaderTeams) error(403)
			} else {
				author = await permission.member(eventId, locals)
			}

			const isSelfAction = author.id === _subscribe.memberId
			if (!isLeaderAction) {
				if (!isSelfAction) error(403)
				if (
					(state === 'cancelled' || state === 'denied') &&
					!author.event.selfSubscribeCancelAllowed
				)
					error(403, "L'annulation ou le refus d'une inscription n'est pas authorisé. ")
			}

			if (state === 'accepted' || state === 'request') {
				// Check if the period is already complet
				const { subscribes, maxSubscribe } = _subscribe.period
				if (maxSubscribe <= subscribes.length) {
					error(403, 'Sorry, this period is already complet')
				}
			}

			if (state === 'accepted') {
				// Check if member is free in this period
				const memberPeriodsAccepted = _subscribe.member.subscribes
					.filter((sub) => sub.state === 'accepted')
					.map((sub) => sub.period)
				const memberIsBusy = !isFreeRange(
					_subscribe.period,
					memberPeriodsAccepted,
					author.event.overlapPeriodAllowed * (1000 * 60)
				)
				if (memberIsBusy) {
					const startMessage = isSelfAction ? 'Tu es' : 'Ce membre est'
					error(403, `${startMessage} déjà occuper durant cette période`)
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

			// Automatique member validation
			if (isLeaderAction && !subscribe.member.isValidedByEvent) {
				await prisma.member.update({
					where: { id: subscribe.memberId },
					data: { isValidedByEvent: true },
				})
				await ensureLicenceMembers(eventId)
			}

			const toMember = subscribe.member.user.wantsNotification ? [subscribe.member.user.email] : []
			const toLeaders = subscribe.period.team.leaders.map((l) => l.user.email)
			const emailOptions = {
				from: subscribe.period.team.event.name,
				to: isLeaderAction ? toMember : toLeaders,
				replyTo: isLeaderAction ? toLeaders : toMember,
			}
			const subjects: Record<SubscribeState, string> = {
				request: 'Nouvelle inscription',
				accepted: 'Inscription acceptée',
				denied: 'Inscription refusée',
				cancelled: 'Inscription annulée',
			}

			if (emailOptions.to.length) {
				await subscribeNotification[state]({
					...emailOptions,
					subject: subjects[state],
					props: { subscribe, authorName: `${author.user.firstName} ${author.user.lastName}` },
				})
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
