import type { Thing, WithContext } from 'schema-dts'
import { EVENT_TIER, parseTierPrice } from '$lib/constant'
import { mapUrl } from '$lib/location'
import { SITE_DESCRIPTION, SITE_NAME } from './metaTags'

export const REPOSITORY_URL = 'https://github.com/peufo/benev'

const CONTEXT = 'https://schema.org' as const

/** Ancres stables, pour que les différents nœuds puissent se référencer entre eux */
const organizationId = (siteUrl: string) => `${siteUrl}/#organization`
const websiteId = (siteUrl: string) => `${siteUrl}/#website`
const softwareId = (siteUrl: string) => `${siteUrl}/#software`

export function organizationSchema(siteUrl: string): WithContext<Thing> {
	return {
		'@context': CONTEXT,
		'@type': 'Organization',
		'@id': organizationId(siteUrl),
		name: SITE_NAME,
		url: siteUrl,
		logo: `${siteUrl}/logo.png`,
		description: SITE_DESCRIPTION,
		areaServed: { '@type': 'Country', name: 'Suisse' },
		sameAs: [REPOSITORY_URL],
	}
}

export function websiteSchema(siteUrl: string): WithContext<Thing> {
	return {
		'@context': CONTEXT,
		'@type': 'WebSite',
		'@id': websiteId(siteUrl),
		name: SITE_NAME,
		url: siteUrl,
		inLanguage: 'fr',
		publisher: { '@id': organizationId(siteUrl) },
	}
}

/**
 * Décrit le produit benevio. À ne rendre que sur l'accueil : le layout racine couvre aussi
 * les pages d'évènement, qui ne sont pas le logiciel.
 *
 * Sans `aggregateRating` ni `review` — aucune note réelle n'est collectée à ce jour — Google
 * n'affichera pas le rich result « Software App ». Le balisage reste utile pour rattacher
 * l'entité et sa grille tarifaire.
 */
export function softwareApplicationSchema(siteUrl: string): WithContext<Thing> {
	return {
		'@context': CONTEXT,
		'@type': 'SoftwareApplication',
		'@id': softwareId(siteUrl),
		name: SITE_NAME,
		url: siteUrl,
		description: SITE_DESCRIPTION,
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		inLanguage: 'fr',
		isAccessibleForFree: true,
		// `codeRepository` appartient à SoftwareSourceCode, pas à SoftwareApplication
		sameAs: [REPOSITORY_URL],
		license: 'https://www.gnu.org/licenses/agpl-3.0.html',
		publisher: { '@id': organizationId(siteUrl) },
		offers: tierOffers(siteUrl),
	}
}

/** Un `Offer` par plan chiffré. Le plan « Pro » (sur mesure) n'a pas de prix à déclarer. */
function tierOffers(siteUrl: string) {
	return Object.entries(EVENT_TIER).flatMap(([tier, { label, price }]) => {
		const { value, unit } = parseTierPrice(price)
		if (!unit) return []
		return [
			{
				'@type': 'Offer' as const,
				name: label,
				price: value,
				priceCurrency: unit,
				category: tier,
				url: `${siteUrl}/me/events/create?plan=${tier}`,
			},
		]
	})
}

type EventSchemaInput = {
	name: string
	url: string
	description?: string | null
	image?: string
	startDate?: Date | null
	endDate?: Date | null
	location?: PrismaJson.Location | null
	web?: string | null
}

/**
 * `location` reste conditionnel : sans lieu renseigné Google n'accorde pas le rich result
 * Event, et il n'y a rien d'honnête à mettre à la place.
 */
export function eventSchema(event: EventSchemaInput): WithContext<Thing> {
	return {
		'@context': CONTEXT,
		'@type': 'Event',
		name: event.name,
		url: event.url,
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		organizer: {
			'@type': 'Organization',
			name: event.name,
			url: event.web || event.url,
		},
		...(event.description && { description: event.description }),
		...(event.image && { image: [event.image] }),
		...(event.startDate && { startDate: event.startDate.toISOString() }),
		...(event.endDate && { endDate: event.endDate.toISOString() }),
		...(event.location && {
			location: {
				'@type': 'Place',
				name: event.location.label,
				address: event.location.label,
				url: mapUrl(event.location),
				...(event.location.coords && {
					geo: {
						'@type': 'GeoCoordinates',
						latitude: event.location.coords.lat,
						longitude: event.location.coords.lon,
					},
				}),
			},
		}),
	}
}

export function breadcrumbSchema(
	items: { name: string; url: string }[]
): WithContext<Thing> | undefined {
	if (items.length < 2) return undefined
	return {
		'@context': CONTEXT,
		'@type': 'BreadcrumbList',
		itemListElement: items.map(({ name, url }, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name,
			item: url,
		})),
	}
}
