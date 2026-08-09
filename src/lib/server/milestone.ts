import { parseFormKey, prisma } from '$lib/server'

/**
 * `PlanX` ouvre le tiroir « nouveau jalon » en passant `{ timestamp }` en JSON dans l'URL: la
 * date en revient en chaîne ISO, là où le type annonce une `Date`. Même reprise que
 * `getPeriodForm` pour `start`/`end`.
 */
export const getMilestoneForm = (milestoneIdOrJson: string | undefined, eventId: string) =>
	parseFormKey(
		milestoneIdOrJson,
		(id) => prisma.milestone.findUnique({ where: { id, eventId } }),
		(milestone) => {
			if (!milestone) return undefined
			return {
				...milestone,
				...(milestone.timestamp ? { timestamp: new Date(milestone.timestamp) } : {}),
			}
		}
	)
