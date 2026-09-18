import { command, form, getRequestEvent } from '$app/server'
import { error, invalid, redirect } from '@sveltejs/kit'
import z from 'zod'
import { modelPeriodCreate, modelPeriodUpdate, validationPeriod } from '$lib/models'
import {
	createLog,
	getPeriodForChange,
	notifyPeriodChange,
	permission,
	prisma,
	settlePeriodUpdate,
} from '$lib/server'

export const createPeriod = form(
	modelPeriodCreate.extend({ redirectTo: z.string().optional() }).superRefine(validationPeriod),
	async ({ redirectTo, ...data }) => {
		const { locals } = getRequestEvent()
		const teamId = data.team.connect.id
		const actor = await permission.leaderOfTeam(teamId, locals)
		const period = await prisma.period.create({ data })
		const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } })
		await createLog('period_create', { period, team, actor })

		if (!redirectTo) return period
		const [path, params] = redirectTo.split('?')
		const searchParams = new URLSearchParams(params)
		searchParams.set('form_period', period.id)
		redirect(303, `${path}?${searchParams.toString()}`)
	}
)

/**
 * Le droit se vérifie sur le secteur que le créneau a, pas sur celui que le formulaire envoie:
 * sinon un·e responsable éditerait n'importe quel créneau en soumettant son propre secteur.
 */
export const updatePeriod = form(
	modelPeriodUpdate.extend({ notify: z.boolean().default(true) }).superRefine(validationPeriod),
	// `data` part tel quel à Prisma, qui refuserait un `notify` inconnu. SvelteKit exige un
	// booléen facultatif dans un schéma de formulaire; absent, on prévient, la voie sûre.
	async ({ notify, ...data }, issue) => {
		const { locals } = getRequestEvent()
		const before = await getPeriodForChange(data.id)
		const actor = await permission.leaderOfTeam(before.teamId, locals)

		const targetTeamId = data.team.connect.id
		if (targetTeamId !== before.teamId) {
			// Responsables, conditions et noms figés au journal sont ceux du secteur: une inscription
			// ne le suit pas.
			if (before.subscribes.length)
				error(400, 'Un créneau qui a des inscriptions ne change pas de secteur')
			await prisma.team.findUniqueOrThrow({
				where: { id: targetTeamId, eventId: before.team.eventId },
				select: { id: true },
			})
			await permission.leaderOfTeam(targetTeamId, locals)
		}

		const accepted = before.subscribes.filter(({ state }) => state === 'accepted').length
		if (data.maxSubscribe !== undefined && data.maxSubscribe < accepted) {
			const s = accepted > 1 ? 's' : ''
			invalid(
				issue.maxSubscribe(
					`${accepted} inscription${s} déjà acceptée${s} : le nombre de places ne peut pas descendre en dessous`
				)
			)
		}

		const period = await prisma.period.update({ where: { id: data.id }, data })
		await settlePeriodUpdate(before, period, actor, notify)
		return period
	}
)

/**
 * Les inscriptions tombent avec le créneau (`onDelete: Cascade`). Celles qui engageaient
 * quelqu'un reçoivent chacune leur ligne, pour que la page du membre en garde la trace; les
 * déclinées et annulées gardent leur historique de statut, c'est assez. Hors brouillon, chaque
 * inscrit·e est prévenu·e.
 */
export const deletePeriod = form(
	z.object({ id: z.string(), redirectTo: z.string().optional() }),
	async ({ id, redirectTo }) => {
		const { locals } = getRequestEvent()
		const period = await getPeriodForChange(id)
		const actor = await permission.leaderOfTeam(period.teamId, locals)
		await prisma.period.delete({ where: { id } })
		await createLog('period_delete', { period, team: period.team, actor })
		for (const subscribe of period.subscribes) {
			await createLog('subscribe_delete', { subscribe: { ...subscribe, period }, actor })
		}
		if (period.team.state !== 'draft') await notifyPeriodChange(period, null, actor)
		if (redirectTo) redirect(303, redirectTo)
	}
)

/**
 * Deux appels impératifs, dupliquer la période courante et la déplacer depuis le planning, qui
 * postaient un `FormData` construit à la main. En `command()`, les arguments passent par devalue:
 * les dates restent des dates, sans jeton de coercition.
 *
 * Dupliquer n'entre pas au journal. Déplacer y entre au même titre qu'`updatePeriod`: seulement
 * quand le changement atteint des inscrit·es déjà prévenu·es, le glisser-déposer d'un brouillon
 * restant muet.
 */
export const duplicatePeriod = command(
	z
		.object({
			teamId: z.string(),
			start: z.date(),
			end: z.date(),
			maxSubscribe: z.number().min(1),
			tagIds: z.array(z.string()),
		})
		.superRefine(validationPeriod),
	async ({ teamId, tagIds, ...data }) => {
		const { locals } = getRequestEvent()
		await permission.leaderOfTeam(teamId, locals)
		return prisma.period.create({
			data: {
				...data,
				team: { connect: { id: teamId } },
				tags: { connect: tagIds.map((id) => ({ id })) },
			},
		})
	}
)

// Le planning laisse glisser librement: c'est ici que la durée minimale est refusée, comme
// pour les formulaires.
export const movePeriod = command(
	z
		.object({ id: z.string(), start: z.date(), end: z.date(), notify: z.boolean() })
		.superRefine(validationPeriod),
	async ({ id, start, end, notify }) => {
		const { locals } = getRequestEvent()
		const before = await getPeriodForChange(id)
		const actor = await permission.leaderOfTeam(before.teamId, locals)
		const period = await prisma.period.update({ where: { id }, data: { start, end } })
		await settlePeriodUpdate(before, period, actor, notify)
		return period
	}
)
