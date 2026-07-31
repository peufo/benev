import { page } from '$app/state'

export function getEventTimeZone(): string {
	const timeZone = page.data.event?.timezone || page.data.member?.event.timezone
	if (!timeZone) {
		throw new Error(
			'Timezone not found. Make sure page.data.event.timezone or page.data.member.event.timezone is set.'
		)
	}
	return timeZone
}

/** Liste minimale quand `Intl.supportedValuesOf` n'est pas disponible. */
const FALLBACK_ZONES = [
	'Europe/Zurich',
	'Europe/Paris',
	'Europe/London',
	'America/New_York',
	'America/Los_Angeles',
	'Asia/Tokyo',
	'Asia/Shanghai',
	'Australia/Sydney',
	'Pacific/Auckland',
]

/**
 * Un groupe est représenté par l'une de ses zones et étiqueté par quelques-unes de ses villes:
 * à défaut de données de population, cette liste décide lesquelles passent devant.
 */
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

type TimezoneGroup = { zones: string[]; offset: string; minutes: number }

let groupsCache: TimezoneGroup[] | undefined

function offsetFormat(timezone: string) {
	return new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'longOffset' })
}

function offsetOf(format: Intl.DateTimeFormat, date: Date) {
	const name = format.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value
	// `longOffset` donne « GMT+01:00 », et simplement « GMT » sur le méridien de Greenwich.
	return name?.replace('GMT', '') || '+00:00'
}

function toMinutes(offset: string) {
	const [hours, minutes] = offset.slice(1).split(':').map(Number)
	return (offset.startsWith('-') ? -1 : 1) * (hours * 60 + minutes)
}

/**
 * `Intl.supportedValuesOf('timeZone')` renvoie plus de 400 identifiants, dont la plupart décrivent
 * le même comportement horaire (Europe/Paris, Europe/Madrid, Europe/Berlin…). Les regrouper par
 * signature — le décalage UTC relevé chaque mois de l'année en cours, ce qui sépare aussi les
 * règles de changement d'heure — ramène la liste à une soixantaine d'entrées.
 *
 * Le calcul instancie un formateur par zone: il est fait une fois pour la durée de la page.
 */
function timezoneGroups(): TimezoneGroup[] {
	if (groupsCache) return groupsCache

	let zones: string[]
	try {
		zones = Intl.supportedValuesOf('timeZone')
	} catch {
		zones = FALLBACK_ZONES
	}

	const year = new Date().getUTCFullYear()
	const samples = Array.from({ length: 12 }, (_, month) => new Date(Date.UTC(year, month, 8)))
	const now = new Date()
	const bySignature = new Map<string, TimezoneGroup>()

	for (const zone of zones) {
		const format = offsetFormat(zone)
		const signature = samples.map((date) => offsetOf(format, date)).join('|')
		const group = bySignature.get(signature)
		if (group) {
			group.zones.push(zone)
			continue
		}
		const offset = offsetOf(format, now)
		bySignature.set(signature, { zones: [zone], offset, minutes: toMinutes(offset) })
	}

	groupsCache = [...bySignature.values()]
	return groupsCache
}

function cityOf(zone: string) {
	return (zone.split('/').at(-1) ?? zone).replaceAll('_', ' ')
}

function rankOf(zone: string) {
	const index = PREFERRED_ZONES.indexOf(zone)
	return index === -1 ? PREFERRED_ZONES.length : index
}

/**
 * Une entrée par comportement horaire, étiquetée par son décalage UTC du moment et ses villes
 * les plus connues. `current` — le fuseau déjà enregistré — représente toujours son groupe:
 * autrement une valeur absente de la liste serait remplacée sans bruit à la soumission.
 */
export function timezoneOptions(current?: string | null) {
	const options = timezoneGroups().map((group) => {
		const zones = [...group.zones].sort((a, b) => rankOf(a) - rankOf(b) || a.localeCompare(b))
		const value = current && zones.includes(current) ? current : zones[0]
		const cities = [value, ...zones.filter((zone) => zone !== value)].slice(0, 3).map(cityOf)
		return { minutes: group.minutes, value, label: `UTC${group.offset} · ${cities.join(', ')}` }
	})

	// Alias hérité, identifiant retiré de la base IANA…: la zone enregistrée reste proposée.
	if (current && !options.some((option) => option.value === current)) {
		let offset: string | undefined
		try {
			offset = offsetOf(offsetFormat(current), new Date())
		} catch {
			offset = undefined
		}
		options.push({
			minutes: offset ? toMinutes(offset) : 0,
			value: current,
			label: offset ? `UTC${offset} · ${cityOf(current)}` : current,
		})
	}

	return options
		.sort((a, b) => a.minutes - b.minutes || a.label.localeCompare(b.label))
		.map(({ value, label }) => ({ value, label }))
}
