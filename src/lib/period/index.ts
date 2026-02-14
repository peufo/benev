import type { Period, Subscribe, Team } from '@prisma/client'

export { default as PeriodDrawer } from './PeriodDrawer.svelte'
export { default as PeriodForm } from './PeriodForm.svelte'
export { default as PeriodRow } from './PeriodRow.svelte'

export function periodIsComplet(
	period: Period & { subscribes: Pick<Subscribe, 'state'>[]; team: Pick<Team, 'overflowPermitted'> }
): boolean {
	const nbSubscribe = period.subscribes.filter(
		({ state }) => state === 'accepted' || (state === 'request' && !period.team.overflowPermitted)
	).length
	return nbSubscribe >= period.maxSubscribe
}
