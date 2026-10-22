import dayjs, { type Dayjs } from '#lib/dayjs.js'

const HOUR_MS = 3_600_000

export type Day = { hours: number[]; date: Dayjs }

/**
 * Découpe la plage en jours, et chaque jour en heures **réelles**: le plan place tout en temps
 * écoulé, un jour de changement d'heure compte donc 23 ou 25 cases (`00 01 02 02 03…` en automne).
 * Chaque heure est libellée en relisant l'instant dans le fuseau: `add()` sur un objet `tz` garde
 * le décalage d'origine, et lirait l'heure murale d'avant la bascule.
 */
export function getDays(start: Dayjs, end: Dayjs, timezone: string): Day[] {
	const days: Day[] = []
	for (let day = start; day.isBefore(end);) {
		// `startOf` relit l'heure murale dans le fuseau, et retombe sur le vrai minuit local.
		const next = day.add(1, 'day').startOf('day')
		const until = Math.min(next.valueOf(), end.valueOf())
		const hours: number[] = []
		for (let ms = day.valueOf(); ms < until; ms += HOUR_MS)
			hours.push(dayjs(ms).tz(timezone).hour())
		days.push({ date: day, hours })
		day = next
	}
	return days
}
