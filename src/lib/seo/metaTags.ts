import type { MetaTagsProps } from 'svelte-meta-tags'

export const SITE_NAME = 'benevio'
export const SITE_TAGLINE = 'Plateforme de gestion de bénévoles'
export const SITE_DESCRIPTION =
	'Gère simplement tes bénévoles avec benevio : inscriptions, planification, suivi et communication regroupés dans un outil gratuit pour les petits événements, open source et sans engagement.'

/**
 * Metas de base, surchargées par le `metaTags` publié dans les données de page
 *
 * `og.png` est une bannière 1200×630 : les aperçus (WhatsApp, Facebook, Signal) recadrent en
 * 1.91:1, un logo carré y perdait la moitié de sa hauteur. PNG et non WebP — les crawlers
 * sociaux ne lisent de façon fiable que JPEG et PNG, et aucun n'accepte le SVG.
 */
export function defaultMetaTags(url: URL): MetaTagsProps {
	const image = `${url.origin}/og.png`
	// Sans la query string : filtres et paramètres de tracking pointent la même page canonique
	const canonical = `${url.origin}${url.pathname}`
	return {
		title: SITE_NAME,
		titleTemplate: `%s | ${SITE_TAGLINE}`,
		description: SITE_DESCRIPTION,
		canonical,
		openGraph: {
			type: 'website',
			url: canonical,
			locale: 'fr_FR',
			siteName: SITE_NAME,
			title: `${SITE_NAME} | ${SITE_TAGLINE}`,
			description: SITE_DESCRIPTION,
			images: [
				{ url: image, type: 'image/png', width: 1200, height: 630, alt: `Logo de ${SITE_NAME}` },
			],
		},
		twitter: {
			cardType: 'summary_large_image',
			title: `${SITE_NAME} | ${SITE_TAGLINE}`,
			description: SITE_DESCRIPTION,
			image,
			imageAlt: `Logo de ${SITE_NAME}`,
		},
	}
}

/**
 * `MetaTags` rend son contenu dans un `<svelte:head>` sans dédoublonnage : deux instances
 * empilées produisent deux `<link rel="canonical">`, deux `description`, deux `robots`.
 * On merge donc en amont pour n'en rendre qu'une seule, à la racine.
 *
 * `svelte-meta-tags@3` n'expose pas de helper de merge (l'API `deepMerge` est arrivée en v4,
 * qui exige Svelte 5).
 */
export function mergeMetaTags(
	base: MetaTagsProps,
	override: MetaTagsProps | undefined
): MetaTagsProps {
	if (!override) return base
	return {
		...base,
		...override,
		openGraph: { ...base.openGraph, ...override.openGraph },
		twitter: { ...base.twitter, ...override.twitter },
	}
}

type PageMetaTags = MetaTagsProps & { title?: string; description?: string }

/**
 * Construit un `metaTags` en propageant `title` et `description` vers Open Graph et Twitter,
 * pour éviter de les répéter trois fois à chaque appel.
 *
 * Le `titleTemplate` bascule sur la marque seule : la baseline complète est réservée à
 * l'accueil, les autres pages rendent `<Titre de page> | benevio`.
 */
export function pageMetaTags({ title, description, ...rest }: PageMetaTags): MetaTagsProps {
	// og:title et twitter:title reprennent le titre tel qu'il sera rendu dans <title>
	const socialTitle = title
		? (rest.titleTemplate ?? `%s | ${SITE_NAME}`).replace(/%s/g, title)
		: undefined
	return {
		...(title && { titleTemplate: `%s | ${SITE_NAME}` }),
		...rest,
		...(title && { title }),
		...(description && { description }),
		openGraph: {
			...(socialTitle && { title: socialTitle }),
			...(description && { description }),
			...rest.openGraph,
		},
		twitter: {
			...(socialTitle && { title: socialTitle }),
			...(description && { description }),
			...rest.twitter,
		},
	}
}

/**
 * Extrait une description depuis le contenu tiptap d'une page, en repli quand l'organisateur
 * n'a pas rempli le champ `description`. Google tronque autour de 155 caractères.
 *
 * Le contenu est stocké en JSON tiptap : on parcourt l'arbre pour ne garder que le texte,
 * plutôt que d'embarquer le rendu HTML dans le chemin d'un `load`.
 */
export function tiptapExcerpt(content: string | null | undefined, maxLength = 155): string {
	if (!content || content === 'null') return ''

	let doc: unknown
	try {
		doc = JSON.parse(content)
	} catch {
		return ''
	}

	const parts: string[] = []
	const walk = (node: unknown) => {
		if (Array.isArray(node)) return node.forEach(walk)
		if (!node || typeof node !== 'object') return
		const { type, text, content } = node as { type?: string; text?: string; content?: unknown }
		if (type === 'text' && text) parts.push(text)
		if (content) walk(content)
	}
	walk(doc)

	const text = parts.join(' ').replace(/\s+/g, ' ').trim()
	if (text.length <= maxLength) return text
	return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

/** Metas des pages applicatives : hors index, mais les liens restent suivis */
export const NOINDEX: MetaTagsProps = { robots: 'noindex,nofollow' }
export const NOINDEX_FOLLOW: MetaTagsProps = { robots: 'noindex,follow' }

/**
 * `+error.svelte` remplace le contenu du layout mais pas ses metas : sans ça une erreur
 * s'indexerait sous le titre et la description de la page demandée.
 */
export function errorMetaTags(status: number): MetaTagsProps {
	return pageMetaTags({
		title: status === 404 ? 'Page introuvable' : `Erreur ${status}`,
		...NOINDEX_FOLLOW,
	})
}

type EventMetaInput = {
	name: string
	state: string
	description?: string | null
	posterId?: string | null
}

/**
 * Base commune à toutes les pages d'un évènement. Les sous-pages la surchargent via
 * `mergeMetaTags` pour garder l'affiche et le contexte de l'évènement.
 *
 * L'affiche est servie en `large` (512px) : `medium` (256px) est sous le seuil utile des
 * aperçus sociaux. Carte `summary` plutôt que `summary_large_image`, une affiche étant
 * généralement au format portrait.
 */
export function eventMetaTags(event: EventMetaInput, url: URL): MetaTagsProps {
	const image = event.posterId ? `${url.origin}/media/${event.posterId}?size=large` : undefined
	const imageAlt = `Affiche de ${event.name}`
	return pageMetaTags({
		title: event.name,
		description:
			event.description || `Rejoins l'équipe de bénévoles de ${event.name} sur ${SITE_NAME}.`,
		// Brouillons et archives sont inaccessibles au public : rien à indexer
		...(event.state !== 'published' && NOINDEX_FOLLOW),
		openGraph: {
			...(image && { images: [{ url: image, width: 512, height: 512, alt: imageAlt }] }),
		},
		twitter: {
			cardType: 'summary',
			...(image && { image, imageAlt }),
		},
	})
}
