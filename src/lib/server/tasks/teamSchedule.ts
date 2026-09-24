import type { Task } from '../scheduler'
import { prisma } from '../prisma'
import { createLog } from '../log'
import { planTransitions } from '$lib/team/teamSchedule'

/**
 * Applique les fermetures programmées des secteurs (voir `$lib/team/teamSchedule`). Chaque
 * écriture exige l'état de départ: un secteur déjà refermé à la main n'est ni réécrit ni
 * journalisé, et rejouer une fenêtre après un échec ne produit rien de plus. On ne quitte jamais
 * `draft` ici, donc jamais de `sendPendingSubscribeRequests`.
 */
export const teamSchedule: Task = {
	name: 'team-schedule',
	every: 60_000,
	async run({ since, until }) {
		const window = { gt: since, lte: until }
		const teams = await prisma.team.findMany({
			where: {
				state: 'published',
				OR: [
					{ closeSubscribing: window },
					{ closeSubscribing: null, event: { closeSubscribing: window } },
				],
			},
			include: { event: { select: { closeSubscribing: true } } },
		})

		let applied = 0
		for (const { teamId, from, to } of planTransitions(teams, { since, until })) {
			const { count } = await prisma.team.updateMany({
				where: { id: teamId, state: from },
				data: { state: to },
			})
			if (!count) continue
			applied++
			const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } })
			await createLog('team_state', { team, before: from, actor: null })
		}
		return applied
	},
}
