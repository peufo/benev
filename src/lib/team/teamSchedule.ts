import type { TeamState } from '@prisma/client'

/**
 * La fermeture programmée d'un secteur: à cet instant, `published` repasse en `validated`. Un
 * secteur sans date reprend celle de l'évènement.
 */
export type Scheduled = { closeSubscribing: Date | string | null }

export type ScheduledTeam = Scheduled & {
	id: string
	state: TeamState
	event: Scheduled
}

export type TeamTransition = {
	teamId: string
	at: Date
	from: TeamState
	to: TeamState
}

export function effectiveClose(team: Scheduled, event: Scheduled): Date | null {
	return toDate(team.closeSubscribing ?? event.closeSubscribing)
}

/**
 * Les fermetures dues dans `(since, until]`, dans l'ordre où elles tombent. Seul un secteur
 * publié se ferme: le brouillon est à sens unique, et un secteur validé l'est déjà.
 */
export function planTransitions(
	teams: ScheduledTeam[],
	{ since, until }: { since: Date; until: Date }
): TeamTransition[] {
	const transitions: TeamTransition[] = []
	for (const team of teams) {
		if (team.state !== 'published') continue
		const at = effectiveClose(team, team.event)
		if (!at || at.getTime() <= since.getTime() || at.getTime() > until.getTime()) continue
		transitions.push({ teamId: team.id, at, from: 'published', to: 'validated' })
	}
	return transitions.sort((a, b) => a.at.getTime() - b.at.getTime())
}

/**
 * La fermeture à annoncer, ou rien: une date passée n'a plus d'effet, et elle ne dit rien d'un
 * secteur qui n'est pas ouvert. C'est ce que la carte affiche aux bénévoles.
 */
export function nextClose(
	team: Scheduled & { state: TeamState },
	event: Scheduled & { selfSubscribeAllowed: boolean },
	now = Date.now()
): Date | null {
	if (!event.selfSubscribeAllowed || team.state !== 'published') return null
	const at = effectiveClose(team, event)
	return at && at.getTime() > now ? at : null
}

/** Une date qui a fait l'aller-retour par JSON revient en chaîne ISO. */
function toDate(value: Date | string | null): Date | null {
	if (!value) return null
	return value instanceof Date ? value : new Date(value)
}
