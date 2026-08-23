import type { Component } from 'svelte'
import type { IconProps } from '@lucide/svelte'
import { replaceState } from '$app/navigation'
import { page } from '$app/state'
import type { ResolvedPathname } from '$app/types'

export interface TocSection {
	/** L'`id` de la `<section>` correspondante dans la page. */
	id: string
	label: string
	/** Optionnelle: un sommaire de documentation n'a pas d'icône par section. */
	icon?: Component<IconProps>
}

/**
 * Suit le défilement des sections et désigne celle qui est à l'écran. À appeler depuis le
 * composant qui rend le sommaire — l'état lui appartient, deux sommaires vivants ne se
 * marchent pas dessus.
 */
export function trackActiveSection(getSections: () => TocSection[]) {
	let activeId = $state('')

	$effect(() => {
		const sections = getSections()
		const visible: Record<string, boolean> = {}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) visible[entry.target.id] = entry.isIntersecting
				const first = sections.find(({ id }) => visible[id])
				if (first) activeId = first.id
				// La dernière section est souvent trop courte pour couper la bande de lecture:
				// arrivé en bas de page, c'est elle qu'on regarde.
				else if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 4)
					activeId = sections[sections.length - 1].id
			},
			// Une bande de lecture en haut de l'écran: la section active est la première
			// qui la traverse.
			{ rootMargin: '-15% 0px -60% 0px' }
		)

		for (const { id } of sections) {
			const element = document.getElementById(id)
			if (element) observer.observe(element)
		}
		return () => {
			observer.disconnect()
			activeId = ''
		}
	})

	return {
		/** Vide tant que l'observateur n'a rien vu: la première section fait alors l'actif. */
		get activeId() {
			return activeId || getSections()[0]?.id || ''
		},
	}
}

/** Défilement doux vers une section, sans empiler une entrée d'historique par section visitée. */
export function scrollToSection(event: MouseEvent, id: string) {
	event.preventDefault()
	document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
	// Une navigation superficielle n'admet qu'un chemin résolu: le fragment, qui est tout
	// l'objet ici, s'accroche au chemin courant.
	const target = `${page.url.pathname}#${id}` as ResolvedPathname
	replaceState(target, {})
}
