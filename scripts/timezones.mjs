/**
 * Regroupe les ~420 identifiants IANA par comportement horaire et écrit `src/lib/timezone.data.ts`.
 *
 *   bun run timezones
 *
 * Deux zones sont fusionnées quand elles partagent le même décalage UTC *et* exactement les mêmes
 * instants de changement d'heure sur la fenêtre couverte — Le Caire, Beyrouth et Jérusalem restent
 * donc distincts d'Athènes, dont ils ne diffèrent que par la date des bascules.
 *
 * À relancer quand la fenêtre approche de sa fin (`src/tests/timezone.test.ts` le signale) ou après
 * une mise à jour de tzdata: la liste est figée à ce que connaît le runtime au moment du calcul.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const WINDOW_YEARS = 10
const MINUTE = 60_000
const WEEK = 7 * 86_400_000

/** Zone mise en avant dans son groupe, à défaut de données de population. */
const PREFERRED_ZONES = [
	'Europe/Zurich',
	'Europe/Paris',
	'Europe/Brussels',
	'Europe/London',
	'Europe/Lisbon',
	'Europe/Madrid',
	'Europe/Berlin',
	'Europe/Rome',
	'Europe/Athens',
	'Europe/Bucharest',
	'Europe/Moscow',
	'Europe/Istanbul',
	'Atlantic/Reykjavik',
	'Atlantic/Azores',
	'America/New_York',
	'America/Toronto',
	'America/Chicago',
	'America/Denver',
	'America/Los_Angeles',
	'America/Vancouver',
	'America/Anchorage',
	'America/Mexico_City',
	'America/Bogota',
	'America/Sao_Paulo',
	'America/Argentina/Buenos_Aires',
	'America/Santiago',
	'Africa/Casablanca',
	'Africa/Abidjan',
	'Africa/Lagos',
	'Africa/Cairo',
	'Africa/Nairobi',
	'Africa/Johannesburg',
	'Asia/Jerusalem',
	'Asia/Beirut',
	'Asia/Dubai',
	'Asia/Tehran',
	'Asia/Karachi',
	'Asia/Calcutta',
	'Asia/Kolkata',
	'Asia/Dhaka',
	'Asia/Bangkok',
	'Asia/Singapore',
	'Asia/Hong_Kong',
	'Asia/Shanghai',
	'Asia/Tokyo',
	'Asia/Seoul',
	'Australia/Perth',
	'Australia/Adelaide',
	'Australia/Brisbane',
	'Australia/Sydney',
	'Pacific/Honolulu',
	'Pacific/Fiji',
	'Pacific/Auckland',
]

const formats = new Map()

function offsetAt(zone, ms) {
	let format = formats.get(zone)
	if (!format) {
		format = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
		formats.set(zone, format)
	}
	const name = format.formatToParts(ms).find((part) => part.type === 'timeZoneName').value
	// `longOffset` donne « GMT+01:00 », et simplement « GMT » sur le méridien de Greenwich.
	const offset = name.replace('GMT', '') || '+00:00'
	const [hours, minutes] = offset.slice(1).split(':').map(Number)
	return (offset.startsWith('-') ? -1 : 1) * (hours * 60 + minutes)
}

/**
 * Instants exacts (à la minute) où le décalage change sur [from, to). Le balayage avance d'une
 * semaine — aucune règle IANA n'enchaîne deux bascules plus vite, la pause du Ramadan au Maroc
 * étant la plus courte à ~1 mois — puis dichotomie dans la semaine qui contient le changement.
 */
function transitionsOf(zone, from, to) {
	const shifts = []
	let previous = offsetAt(zone, from)

	for (let cursor = from; cursor < to; cursor += WEEK) {
		const next = Math.min(cursor + WEEK, to)
		const offset = offsetAt(zone, next)
		if (offset === previous) continue

		let before = cursor
		let after = next
		while (after - before > MINUTE) {
			const middle = before + Math.floor((after - before) / 2 / MINUTE) * MINUTE
			if (middle === before) break
			if (offsetAt(zone, middle) === previous) before = middle
			else after = middle
		}
		shifts.push([after / 1000, offset])
		previous = offset
	}

	return shifts
}

function rankOf(zone) {
	const index = PREFERRED_ZONES.indexOf(zone)
	return index === -1 ? PREFERRED_ZONES.length : index
}

const year = new Date().getUTCFullYear()
const from = Date.UTC(year, 0, 1)
const to = Date.UTC(year + WINDOW_YEARS, 0, 1)

let zones
try {
	zones = Intl.supportedValuesOf('timeZone')
} catch {
	throw new Error("Ce runtime n'expose pas Intl.supportedValuesOf('timeZone')")
}

const bySignature = new Map()
for (const zone of zones) {
	const offset = offsetAt(zone, from)
	const shifts = transitionsOf(zone, from, to)
	const signature = `${offset}|${shifts.map((shift) => shift.join(':')).join(',')}`
	const group = bySignature.get(signature)
	if (group) group.zones.push(zone)
	else bySignature.set(signature, { zones: [zone], offset, shifts })
}

const groups = [...bySignature.values()]
	.map((group) => ({
		...group,
		zones: group.zones.sort((a, b) => rankOf(a) - rankOf(b) || a.localeCompare(b)),
	}))
	.sort((a, b) => a.offset - b.offset || a.zones[0].localeCompare(b.zones[0]))

const serialize = (group) =>
	`\t{
\t\tzones: [${group.zones.map((zone) => `'${zone}'`).join(', ')}],
\t\toffset: ${group.offset},
\t\tshifts: [${group.shifts.map(([at, offset]) => `[${at}, ${offset}]`).join(', ')}],
\t},`

const file = `// Généré par \`bun run timezones\` (scripts/timezones.mjs) — ne pas éditer à la main.
// ${zones.length} identifiants IANA ramenés à ${groups.length} comportements horaires distincts.

export type TimezoneGroup = {
	/** Zones au comportement strictement identique, la plus connue en tête. */
	zones: string[]
	/** Décalage UTC en minutes au début de la fenêtre couverte. */
	offset: number
	/** Changements de décalage à venir: \`[seconde epoch, nouveau décalage en minutes]\`. */
	shifts: [number, number][]
}

/** Dernière seconde epoch pour laquelle \`shifts\` fait autorité. */
export const TIMEZONE_WINDOW_END = ${to / 1000}

export const TIMEZONE_GROUPS: TimezoneGroup[] = [
${groups.map(serialize).join('\n')}
]
`

const target = fileURLToPath(new URL('../src/lib/timezone.data.ts', import.meta.url))
writeFileSync(target, file)
execFileSync('npx', ['prettier', '--write', target], { stdio: 'ignore' })

const shiftCount = groups.reduce((total, group) => total + group.shifts.length, 0)
console.log(
	`${zones.length} zones → ${groups.length} groupes, ${shiftCount} bascules jusqu'en ${year + WINDOW_YEARS}`
)
