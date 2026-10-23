/**
 * L'heure murale d'un fuseau, lue par `Intl` et non par le plugin `timezone` de dayjs: celui-ci
 * repasse par le fuseau de la machine (`startOf`, `add`), et se trompe d'une heure dès que la
 * machine et l'évènement ne changent pas d'heure le même jour.
 *
 * Une heure murale s'écrit ici comme un instant UTC dont les champs `getUTC*` sont ceux du cadran:
 * l'arithmétique sur les jours y est exacte, sans jour de 23 ou 25 heures.
 */

const DAY_MS = 24 * 60 * 60 * 1000

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatterOf(timeZone: string) {
	let formatter = formatters.get(timeZone)
	if (!formatter) {
		formatter = new Intl.DateTimeFormat('en-US', {
			timeZone,
			hourCycle: 'h23',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		})
		formatters.set(timeZone, formatter)
	}
	return formatter
}

export function wallClock(ms: number, timeZone: string): number {
	const parts: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {}
	for (const { type, value } of formatterOf(timeZone).formatToParts(ms)) parts[type] = Number(value)
	const { year = 0, month = 1, day = 1, hour = 0, minute = 0, second = 0 } = parts
	return Date.UTC(year, month - 1, day, hour, minute, second, ((ms % 1000) + 1000) % 1000)
}

/**
 * L'instant qui affiche `wall` dans `timeZone`. Une heure qui revient deux fois à l'automne prend
 * sa seconde occurrence; une heure sautée au printemps, celle qui la suit.
 */
export function fromWallClock(wall: number, timeZone: string): number {
	const offsetAt = (ms: number) => wallClock(ms, timeZone) - ms
	return wall - offsetAt(wall - offsetAt(wall))
}

/** Déplace de `days` jours sans toucher l'heure murale, changement d'heure ou non. */
export function shiftDays(date: Date | number, days: number, timeZone: string): Date {
	return new Date(fromWallClock(wallClock(+date, timeZone) + days * DAY_MS, timeZone))
}
