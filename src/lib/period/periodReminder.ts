/**
 * Le rappel envoyé aux inscrit·es acceptés avant un créneau. Un seul par créneau, à un délai que
 * l'évènement choisit dans cette liste. `0` coupe le rappel: un entier plutôt que `null`, parce
 * qu'un champ de `form()` ne transporte pas `null`.
 */
export const REMINDER_OPTIONS = [
	{ value: 0, label: 'Aucun rappel' },
	{ value: 2, label: '2 heures avant' },
	{ value: 24, label: '24 heures avant' },
	{ value: 72, label: '3 jours avant' },
] as const

export const REMINDER_HOURS = REMINDER_OPTIONS.map(({ value }) => value)

/** Le plus long délai proposé: la tâche lit les créneaux jusqu'à cette distance de sa fenêtre. */
export const REMINDER_MAX_HOURS = Math.max(...REMINDER_HOURS)

const HOUR = 60 * 60_000

export type Remindable = {
	start: Date | string
	event: { reminderHours: number }
}

export function reminderAt(start: Date | string, hours: number): Date | null {
	if (hours <= 0) return null
	return new Date(new Date(start).getTime() - hours * HOUR)
}

/**
 * Les créneaux dont le rappel tombe dans `(since, until]`, dans l'ordre où ils tombent. Comme
 * pour la fermeture d'un secteur, un instant déjà passé quand le créneau a été posé ne rappelle
 * jamais: c'est le cas d'une inscription acceptée moins d'un délai avant le début, que le courriel
 * d'acceptation vient de renseigner.
 */
export function planReminders<T extends Remindable>(
	periods: T[],
	{ since, until }: { since: Date; until: Date }
): T[] {
	return periods
		.map((period) => ({ period, at: reminderAt(period.start, period.event.reminderHours) }))
		.filter(
			(item): item is { period: T; at: Date } =>
				!!item.at && item.at.getTime() > since.getTime() && item.at.getTime() <= until.getTime()
		)
		.sort((a, b) => a.at.getTime() - b.at.getTime())
		.map(({ period }) => period)
}
