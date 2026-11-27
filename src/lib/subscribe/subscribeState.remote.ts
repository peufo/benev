import { error } from '@sveltejs/kit'
import type { Prisma, SubscribeState } from '@prisma/client'
import { form, getRequestEvent } from '$app/server'
import { ROOT_USER } from '$app/env/private'
import { isFreeRange } from 'perod'
import z from 'zod'
import {
	createLog,
	includeForRequestNotification,
	includeMemberRole,
	memberHasRole,
	notifySubscribeRequest,
	notifyTierQuotaIfNeeded,
	permission,
	prisma,
} from '#lib/server/index.js'
import { subscribeNotification } from '#lib/email/subscribeNotification.js'
import { periodIsComplet } from '#lib/period/index.js'
import { canAccessEvent, isMemberMailHeld, isSubscribeAnnounced } from '#lib/event/eventAccess.js'

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
	async ({ subscribeId, state }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!

		const whereSubscribe: Prisma.SubscribeWhereInput = {
			id: { not: subscribeId },
			state: { in: ['accepted', 'request'] },
		}

		// Le rôle d'admin ne vaut que pour l'évènement de l'URL: une inscription d'un autre
		// évènement n'existe pas ici.
		const _subscribe = await prisma.subscribe.findUnique({
			where: { id: subscribeId, period: { team: { eventId } } },
			include: {
				member: {
					include: {
						...includeMemberRole,
						subscribes: {
							where: whereSubscribe,
							include: { period: true },
						},
					},
				},
				period: {
					include: {
						team: { select: { overflowPermitted: true, state: true } },
						subscribes: {
							where: whereSubscribe,
						},
					},
				},
			},
		})
		if (!_subscribe) error(404, 'Cette inscription est introuvable')

		const isSubscriberEdition = subscriberEditions[_subscribe.state].includes(state)
		const isCreatorEdition = creatorEditions[_subscribe.state].includes(state)
		if (!isCreatorEdition && !isSubscriberEdition)
			error(403, 'Cette inscription ne peut pas passer à cet état')

		let author = await permission.member(eventId, locals)
		const isSelfAction = author.id === _subscribe.memberId
		// La seule origine d'une validation forcée: un responsable qui confirme, au nom du membre,
		// une inscription qu'il a lui-même proposée.
		const isForcedValidation =
			state === 'accepted' && !isSelfAction && _subscribe.createdBy === 'leader'
		const isLeaderAction =
			isForcedValidation || (_subscribe.createdBy === 'leader') === isCreatorEdition
		if (isLeaderAction) {
			author = await permission.leader(eventId, locals)
			const isInLeaderTeams = author.leaderOf.find(({ id }) => id === _subscribe.period.teamId)
			if (!author.roles.includes('admin') && !isInLeaderTeams)
				error(403, "Tu n'es pas responsable de ce secteur")
		}

		if (!isLeaderAction) {
			if (!isSelfAction) error(403, 'Seule la personne inscrite peut répondre à cette inscription')
			// Comme pour s'inscrire: un évènement fermé ne se manipule pas par un appel direct.
			const session = await locals.auth.validate()
			const userIsRoot = session?.user.email === ROOT_USER
			if (!canAccessEvent(author.event, author, userIsRoot))
				error(403, "Cet évènement n'est pas ouvert")
			// Un brouillon n'est pas visible du membre: il n'a rien à y répondre.
			if (_subscribe.period.team.state === 'draft') error(403)
			if ((state === 'cancelled' || state === 'denied') && !author.event.selfSubscribeCancelAllowed)
				error(403, "L'annulation ou le refus d'une inscription n'est pas autorisé")
		}

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
				error(403, `${startMessage} déjà occupé durant ce créneau`)
			}
		}

		const { overflowPermitted } = _subscribe.period.team
		if (state === 'accepted' || (state === 'request' && !overflowPermitted)) {
			if (periodIsComplet(_subscribe.period)) {
				error(403, 'Ce créneau est complet')
			}
		}

		// Le geste d'un membre écrit aux responsables; celui d'un responsable, au membre.
		const hasRole = !isLeaderAction || memberHasRole(_subscribe.member, author.event)
		const isHeld = isMemberMailHeld(author.event.state, _subscribe.period.team.state, {
			hasRole,
			announced: isSubscribeAnnounced(_subscribe),
		})
		const subscribe = await prisma.subscribe.update({
			where: { id: subscribeId },
			data: {
				state,
				isForcedValidation,
				// L'envoi d'une vie antérieure ne vaut pas pour la demande renouvelée.
				...(state === 'request' && { notifiedAt: null }),
			},
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
										userId: { not: null },
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

		const authorName = `${author.firstName} ${author.lastName}`
		// Une demande renouvelée part comme la première: le marqueur posé avant l'envoi, rendu si la
		// file refuse, et retenue tant que son destinataire ne peut pas y répondre.
		if (state === 'request') {
			const renewed = await prisma.subscribe.findUniqueOrThrow({
				where: { id: subscribeId },
				include: includeForRequestNotification,
			})
			await notifySubscribeRequest(renewed, authorName)
			return
		}

		if (isHeld) return

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
			const queued = await subscribeNotification[state]({
				...emailOptions,
				subject: subjects[state],
				props: { subscribe, authorName },
			})
			// Une validation forcée apprend au membre son inscription: aucune relâche ne doit la lui
			// annoncer une seconde fois.
			if (queued && isLeaderAction && !subscribe.notifiedAt)
				await prisma.subscribe.update({
					where: { id: subscribeId },
					data: { notifiedAt: new Date() },
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
