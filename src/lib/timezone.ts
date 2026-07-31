import { page } from '$app/state'
import { TIMEZONE_GROUPS, type TimezoneGroup } from './timezone.data'

export function getEventTimeZone(): string {
	const timeZone = page.data.event?.timezone || page.data.member?.event.timezone
	if (!timeZone) {
		throw new Error(
			'Timezone not found. Make sure page.data.event.timezone or page.data.member.event.timezone is set.'
		)
	}
	return timeZone
}

/** Zones dont l'identifiant IANA porte encore l'ancien nom de la ville dans certains runtimes. */
const RENAMED_CITIES: Record<string, string> = {
	'America/Godthab': 'Nuuk',
	'Asia/Calcutta': 'Kolkata',
	'Asia/Katmandu': 'Kathmandu',
	'Asia/Rangoon': 'Yangon',
	'Asia/Saigon': 'Hô-Chi-Minh-Ville',
	'Europe/Kiev': 'Kyiv',
	'Pacific/Enderbury': 'Kanton',
}

function cityOf(zone: string) {
	return RENAMED_CITIES[zone] ?? (zone.split('/').at(-1) ?? zone).replaceAll('_', ' ')
}

/** Décalage en vigueur maintenant, lu dans les bascules précalculées du groupe. */
function offsetOf(group: TimezoneGroup, now: number) {
	let offset = group.offset
	for (const [at, next] of group.shifts) {
		if (at > now) break
		offset = next
	}
	return offset
}

function formatOffset(minutes: number) {
	const hours = Math.floor(Math.abs(minutes) / 60)
	const rest = Math.abs(minutes) % 60
	return `${minutes < 0 ? '-' : '+'}${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

/**
 * Une entrée par comportement horaire — soit une soixantaine, contre plus de 400 identifiants
 * IANA — étiquetée par son décalage UTC du moment et ses villes les plus connues.
 *
 * `current`, le fuseau déjà enregistré, représente toujours son groupe: autrement une valeur
 * absorbée par un autre représentant serait remplacée sans bruit à la première soumission.
 */
export function timezoneOptions(current?: string | null) {
	const now = Date.now() / 1000

	const options = TIMEZONE_GROUPS.map((group) => {
		const value = current && group.zones.includes(current) ? current : group.zones[0]
		const others = group.zones.filter((zone) => zone !== value)
		const cities = [value, ...others].slice(0, 3).map(cityOf)
		const minutes = offsetOf(group, now)
		return { minutes, value, label: `UTC${formatOffset(minutes)} · ${cities.join(', ')}` }
	})

	// Zone ajoutée à la base IANA depuis la génération, alias propre à un navigateur…: quoi qu'il
	// arrive, la valeur enregistrée reste proposée telle quelle.
	if (current && !options.some((option) => option.value === current)) {
		options.push({ minutes: 0, value: current, label: cityOf(current) })
	}

	return options
		.sort((a, b) => a.minutes - b.minutes || a.label.localeCompare(b.label))
		.map(({ value, label }) => ({ value, label }))
}
