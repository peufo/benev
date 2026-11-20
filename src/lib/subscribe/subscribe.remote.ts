import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { ROOT_USER } from '$app/env/private'
import { isFreeRange } from 'perod'
import { modelSubscribe } from '#lib/models/index.js'
import {
	addMemberComputedValues,
	createLog,
	includeForRequestNotification,
	permission,
	prisma,
	notifySubscribeRequest,
} from '#lib/server/index.js'
import { isMemberAllowed, memberIsRegistered } from '#lib/member/index.js'
import { periodIsComplet } from '#lib/period/index.js'
import { canAccessEvent } from '#lib/event/eventAccess.js'

export const createSubscribe = form(modelSubscribe, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const session = await locals.auth.validate()
	if (!session) error(401)

	const [period, memberAuthor, memberInvited] = await Promise.all([
		// L'évènement de l'URL est celui que les gardes contrôlent: un créneau ou une fiche d'un
		// autre évènement n'existent pas ici.
		prisma.period.findUnique({
			where: { id: data.periodId, team: { eventId } },
			include: {
				subscribes: { where: { state: { in: ['accepted', 'request'] } } },
				team: {
					select: {
						state: true,
						conditions: true,
						overflowPermitted: true,
					},
				},
			},
		}),
		prisma.member.findUnique({
			where: { userId_eventId: { userId: session.user.id, eventId } },
			// De quoi passer par `addMemberComputedValues`, et savoir si le profil est complet:
			// bien plus léger que `getMemberProfile`, qui remonterait périodes et inscriptions.
			include: { event: { include: { memberFields: true } }, leaderOf: true, user: true },
		}),
		prisma.member.findUnique({
			where: { id: data.memberId, eventId },
			include: {
				subscribes: {
					where: { state: { in: ['accepted', 'request'] } },
					include: { period: true },
				},
			},
		}),
	])

	if (!period) error(404, 'Ce créneau est introuvable')
	if (!memberInvited) error(404, 'Ce membre est introuvable')
	// Aucune fiche reliée à ce compte: l'adhésion reste à faire, et le tunnel est le seul chemin.
	if (!memberAuthor) error(403, `Tu n'es pas encore membre de cet évènement`)

	if (periodIsComplet(period)) {
		error(403, 'Ce créneau est complet')
	}

	const isLeaderOfTeam = await permission
		.leaderOfTeam(period.teamId, locals)
		.then(() => true)
		.catch(() => false)
	const isSelfSubscribe = data.memberId === memberAuthor.id
	if (!isLeaderOfTeam && !isSelfSubscribe) error(403)

	if (!isLeaderOfTeam) {
		const author = addMemberComputedValues(memberAuthor)
		// Un évènement en brouillon ou archivé est fermé aux bénévoles: le layout le cache, et
		// l'appel direct ne doit pas les y faire entrer.
		const userIsRoot = session.user.email === ROOT_USER
		if (!canAccessEvent(author.event, author, userIsRoot))
			error(403, "Cet évènement n'est pas ouvert")
		if (!memberAuthor.event.selfSubscribeAllowed) error(403)
		// Seul un secteur publié est ouvert aux inscriptions libres; un brouillon n'est même pas visible.
		if (period.team.state !== 'published') error(403)
		// Le tunnel d'inscription n'est pas décoratif: ce que l'évènement rend obligatoire est
		// demandé avant la première période, pas après.
		if (!memberIsRegistered(author))
			error(403, `Complète ton profil avant de t'inscrire à un créneau`)
		if (!isMemberAllowed(period.team.conditions, memberAuthor)) error(403)
	}

	const isMemberBusy = !isFreeRange(
		period,
		memberInvited.subscribes.map((sub) => sub.period),
		memberAuthor.event.overlapPeriodAllowed * (1000 * 60)
	)
	if (isMemberBusy) {
		const startMessage = isSelfSubscribe ? 'Tu es' : 'Ce membre est'
		error(403, `${startMessage} déjà occupé durant ce créneau`)
	}

	// Une inscription attend toujours le camp qui ne l'a pas créée: seul un responsable qui
	// s'inscrit lui-même n'attend personne. Un membre sans compte n'y fait pas exception, il
	// répondra une fois son invitation acceptée; d'ici là, le responsable peut confirmer à sa place.
	const isAutoAccepted = isLeaderOfTeam && isSelfSubscribe

	// Une inscription annulée ou refusée garde sa ligne, et la paire membre/période est unique:
	// se réinscrire réactive celle-ci plutôt que d'échouer sur la contrainte. Ni la validation
	// forcée ni l'envoi d'une vie antérieure ne doivent y survivre.
	const subscribeData = {
		isForcedValidation: false,
		notifiedAt: null,
		state: isAutoAccepted ? ('accepted' as const) : ('request' as const),
		createdBy: isSelfSubscribe ? ('user' as const) : ('leader' as const),
	}
	const subscribe = await prisma.subscribe.upsert({
		where: { memberId_periodId: { memberId: data.memberId, periodId: data.periodId } },
		create: { ...data, ...subscribeData },
		update: { ...subscribeData, isAbsent: false },
		include: includeForRequestNotification,
	})

	await createLog('subscribe_create', { subscribe, actor: session.user })

	if (isLeaderOfTeam && isSelfSubscribe) return
	await notifySubscribeRequest(subscribe, `${session.user.firstName} ${session.user.lastName}`)
})
