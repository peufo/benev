import dayjs, { type Dayjs } from '#lib/dayjs.js'
import { startOfNextDay } from '#lib/wallClock.js'
import { time } from './utils'

const HOUR_MS = time(1, 'hour').to('ms')

export type Day = { hours: number[]; date: Dayjs }

/**
 * Découpe la plage en jours, et chaque jour en heures **réelles**: le plan place tout en temps
 * écoulé, un jour de changement d'heure compte donc 23 ou 25 cases (`00 01 02 02 03…` en automne).
 * Minuits et heures se lisent par `Intl` (`#lib/wallClock`), jamais par `add()` ou `startOf()` de
 * dayjs, qui repassent par le fuseau de la machine: un navigateur à New York découperait mal le jour
 * de bascule d'un évènement à Zurich. Un seul formateur sert toute la plage: `.tz()` en recrée un
 * à chaque appel, soit des centaines par plan.
 */
export function getDays(start: Dayjs, end: Dayjs, timezone: string): Day[] {
	const hourOf = new Intl.DateTimeFormat('en-GB', {
		timeZone: timezone,
		hour: 'numeric',
		hourCycle: 'h23',
	})
	const days: Day[] = []
	for (let day = start; day.isBefore(end);) {
		const next = dayjs(startOfNextDay(day.valueOf(), timezone)).tz(timezone)
		const until = Math.min(next.valueOf(), end.valueOf())
		const hours: number[] = []
		for (let ms = day.valueOf(); ms < until; ms += HOUR_MS) hours.push(Number(hourOf.format(ms)))
		days.push({ date: day, hours })
		day = next
	}
	return days
}

export type HourTick = { span: number; label: string }

/**
 * Les graduations d'un jour, une toutes les `hourSpan` heures. La dernière, tronquée par la fin du
 * jour, reste muette: son libellé déborderait sur le jour suivant.
 */
export function getHourTicks(hours: number[], hourSpan: number): HourTick[] {
	const ticks: HourTick[] = []
	for (let i = 0; i < hours.length; i += hourSpan) {
		const span = Math.min(hourSpan, hours.length - i)
		ticks.push({ span, label: span < hourSpan ? '' : hours[i].toString().padStart(2, '0') })
	}
	return ticks
}
