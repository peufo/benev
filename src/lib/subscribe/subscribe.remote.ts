import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { isFreeRange } from 'perod'
import { modelSubscribe } from '$lib/models'
import { addMemberComputedValues, createLog, permission, prisma } from '$lib/server'
import { isMemberAllowed, memberIsRegistered } from '$lib/member'
import { subscribeNotification } from '$lib/email/subscribeNotification'
import { periodIsComplet } from '$lib/period/index.js'

export const createSubscribe = form(modelSubscribe, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const session = await locals.auth.validate()
	if (!session) error(401)

	const [period, memberAuthor, memberInvited] = await Promise.all([
		prisma.period.findUniqueOrThrow({
			where: { id: data.periodId },
			include: {
				subscribes: { where: { state: { in: ['accepted', 'request'] } } },
				team: { select: { closeSubscribing: true, conditions: true, overflowPermitted: true } },
			},
		}),
		prisma.member.findUnique({
			where: { userId_eventId: { userId: session.user.id, eventId } },
			// De quoi passer par `addMemberComputedValues`, et savoir si le profil est complet:
			// bien plus léger que `getMemberProfile`, qui remonterait périodes et inscriptions.
			include: { event: { include: { memberFields: true } }, leaderOf: true, user: true },
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

	// Aucune fiche reliée à ce compte: l'adhésion reste à faire, et le tunnel est le seul chemin.
	if (!memberAuthor) error(403, `Tu n'es pas encore membre de cet évènement`)

	// Check if the period is already complet
	if (periodIsComplet(period)) {
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
		// Le tunnel d'inscription n'est pas décoratif: ce que l'évènement rend obligatoire est
		// demandé avant la première période, pas après.
		if (!memberIsRegistered(addMemberComputedValues(memberAuthor)))
			error(403, `Complète ton profil avant de t'inscrire à une période`)
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

	// Une inscription annulée ou refusée garde sa ligne, et la paire membre/période est unique:
	// se réinscrire réactive celle-ci plutôt que d'échouer sur la contrainte.
	const subscribeData = {
		isForcedValidation: isAutoAccepted && !memberInvited.userId,
		state: isAutoAccepted ? ('accepted' as const) : ('request' as const),
		createdBy: isSelfSubscribe ? ('user' as const) : ('leader' as const),
	}
	const subscribe = await prisma.subscribe.upsert({
		where: { memberId_periodId: { memberId: data.memberId, periodId: data.periodId } },
		create: { ...data, ...subscribeData },
		update: { ...subscribeData, isAbsent: false },
		include: {
			member: true,
			period: {
				include: {
					team: {
						include: {
							leaders: true,
							event: {
								include: { owner: { select: { email: true } } },
							},
						},
					},
				},
			},
		},
	})

	await createLog('subscribe_create', { subscribe, actor: session.user })

	if (isLeaderOfTeam && isSelfSubscribe) return

	const memberMail =
		subscribe.member.isNotifiedSubscribe && subscribe.member.email ? [subscribe.member.email] : []
	const leadersMail = subscribe.period.team.leaders.map(({ email }) => email as string)
	if (leadersMail.length === 0) {
		leadersMail.push(subscribe.period.team.event.owner.email)
	}
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
})
