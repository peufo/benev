import { error } from '@sveltejs/kit'
import type { Prisma, SubscribeState } from '@prisma/client'
import { form, getRequestEvent } from '$app/server'
import { isFreeRange } from 'perod'
import z from 'zod'
import { createLog, notifyTierQuotaIfNeeded, permission, prisma } from '$lib/server'
import { subscribeNotification } from '$lib/email/subscribeNotification'
import { periodIsComplet } from '$lib/period'

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

/**
 * Ces formulaires sont montés depuis des listes (`admin/subscribes`, cartes de période…) où
 * `params.subscribeId` n'existe pas: l'inscription visée voyage donc en champ caché.
 */
export const setSubscribeState = form(
	z.object({
		subscribeId: z.string(),
		state: z.enum(['request', 'accepted', 'denied', 'cancelled']),
	}),
	async ({ subscribeId, state: _state }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		let state = _state

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
						team: { select: { overflowPermitted: true } },
						subscribes: {
							where: whereSubscribe,
						},
					},
				},
			},
		})

		const isSubscriberEdition = subscriberEditions[_subscribe.state].includes(state)
		const isCreatorEdition = creatorEditions[_subscribe.state].includes(state)
		if (!isCreatorEdition && !isSubscriberEdition) error(403, 'Invalid edition')

		// Check author permission
		let author = await permission.member(eventId, locals)
		const isSelfAction = author.id === _subscribe.memberId
		let isForcedValidation =
			state == 'accepted' && !isSelfAction && _subscribe.createdBy === 'leader'
		const isLeaderAction =
			isForcedValidation || (_subscribe.createdBy === 'leader') === isCreatorEdition
		if (isLeaderAction) {
			author = await permission.leader(eventId, locals)
			const isInLeaderTeams = author.leaderOf.find(({ id }) => id === _subscribe.period.teamId)
			if (!author.roles.includes('admin') && !isInLeaderTeams)
				error(403, "You're not leader of this team")
		}

		if (!isLeaderAction) {
			if (!isSelfAction) error(403, "You can't self update subscribe status")
			if ((state === 'cancelled' || state === 'denied') && !author.event.selfSubscribeCancelAllowed)
				error(403, "L'annulation ou le refus d'une inscription n'est pas authorisé.")
		}

		// Enure auto accept if membre don't have user account behind
		if (state === 'request' && !_subscribe.member.userId) {
			state = 'accepted'
			isForcedValidation = true
		}

		// Check if member is free in this period
		if (state === 'accepted') {
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
				error(403, `${startMessage} déjà occupé durant cette période`)
			}
		}

		// Check if the period is already complet
		const { overflowPermitted } = _subscribe.period.team
		if (state === 'accepted' || (state === 'request' && !overflowPermitted)) {
			if (periodIsComplet(_subscribe.period)) {
				error(403, 'Sorry, this period is already complet')
			}
		}

		const subscribe = await prisma.subscribe.update({
			where: { id: subscribeId },
			data: { state, isForcedValidation },
			include: {
				member: true,
				period: {
					include: {
						team: {
							include: {
								event: true,
								leaders: {
									where: {
										email: { not: null },
										isValidedByUser: true,
										isNotifiedLeaderOfSubscribe: true,
									},
								},
							},
						},
					},
				},
			},
		})

		await createLog('subscribe_state', {
			subscribe,
			before: _subscribe.state,
			actor: author,
		})

		// Automatique member validation
		if (isLeaderAction && !subscribe.member.isValidedByEvent) {
			await prisma.member.update({
				where: { id: subscribe.memberId },
				data: { isValidedByEvent: true },
			})
			await notifyTierQuotaIfNeeded(eventId)
			// Validation implicite: l'organisateur ne l'a pas décidée en tant que telle, mais elle
			// change le statut du membre — elle doit se lire dans son journal.
			await createLog('member_validated', {
				member: subscribe.member,
				actor: author,
				isValidedByEvent: true,
			})
		}

		const toMember =
			subscribe.member.isNotifiedSubscribe && subscribe.member.email ? [subscribe.member.email] : []
		const toLeaders = subscribe.period.team.leaders.map(({ email }) => email as string)
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
				props: { subscribe, authorName: `${author.firstName} ${author.lastName}` },
			})
		}
	}
)

/** Le membre et le secteur sont chargés pour le journal: leurs noms y sont figés. */
const includeForLog = {
	member: true,
	period: { include: { team: true } },
} satisfies Prisma.SubscribeInclude

export const deleteSubscribe = form(
	z.object({ subscribeId: z.string() }),
	async ({ subscribeId }) => {
		// TODO: un petit mail à l'inscrit ?
		const { locals } = getRequestEvent()
		const subscribe = await prisma.subscribe.findUniqueOrThrow({
			where: { id: subscribeId },
			include: includeForLog,
		})
		const author = await permission.leaderOfTeam(subscribe.period.teamId, locals)
		const deleted = await prisma.subscribe.delete({ where: { id: subscribeId } })
		await createLog('subscribe_delete', { subscribe, actor: author })
		return deleted
	}
)

export const toggleSubscribeIsAbsent = form(
	z.object({ subscribeId: z.string() }),
	async ({ subscribeId }) => {
		const { locals } = getRequestEvent()
		const subscribe = await prisma.subscribe.findUniqueOrThrow({
			where: { id: subscribeId },
			include: includeForLog,
		})
		const author = await permission.leaderOfTeam(subscribe.period.teamId, locals)
		const isAbsent = !subscribe.isAbsent
		const updated = await prisma.subscribe.update({
			where: { id: subscribeId },
			data: { isAbsent },
		})
		await createLog('subscribe_absent', {
			subscribe: { ...subscribe, isAbsent },
			actor: author,
		})
		return updated
	}
)
