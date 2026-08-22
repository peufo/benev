import type { Component } from 'svelte'
import type { IconProps } from '@lucide/svelte'
import {
	AtSignIcon,
	CalendarIcon,
	ClipboardCheckIcon,
	EyeIcon,
	IdCardIcon,
	LogInIcon,
	OctagonAlertIcon,
	PaletteIcon,
	ScrollTextIcon,
	SigmaIcon,
	UsersIcon,
} from '@lucide/svelte'
import { replaceState } from '$app/navigation'

export interface SubNavSection {
	/** L'`id` de la `<section>` correspondante dans la page. */
	id: string
	label: string
	icon: Component<IconProps>
}

/**
 * Les sections de `/[eventId]/admin/dashboard`, dans l'ordre où la page les rend. Le journal est
 * réservé aux admins: sans lui, le rail proposerait une ancre que la page ne rend pas.
 */
export function dashboardSections(withJournal: boolean): SubNavSection[] {
	return [
		{ id: 'stats', label: 'Chiffres clés', icon: SigmaIcon },
		{ id: 'members', label: 'Derniers adhérents', icon: UsersIcon },
		{ id: 'validations', label: 'À valider', icon: ClipboardCheckIcon },
		...(withJournal ? [{ id: 'journal', label: 'Journal', icon: ScrollTextIcon }] : []),
	]
}

/**
 * Les sections de `/[eventId]/admin/settings`, rendues par le rail admin sous son onglet actif.
 * Déclarées ici plutôt que publiées par la page: les dériver de la route évite un registre
 * mutable, qui serait partagé entre les requêtes au rendu serveur.
 */
export const SETTINGS_SECTIONS: SubNavSection[] = [
	{ id: 'status', label: 'Statut', icon: EyeIcon },
	{ id: 'essentials', label: "L'essentiel", icon: CalendarIcon },
	{ id: 'contact', label: 'Contact', icon: AtSignIcon },
	{ id: 'appearance', label: 'Identité', icon: PaletteIcon },
	{ id: 'membership', label: 'Adhésion', icon: LogInIcon },
	{ id: 'fields', label: 'Champs', icon: IdCardIcon },
	{ id: 'danger', label: 'Danger', icon: OctagonAlertIcon },
]

// Écrit uniquement depuis un `$effect`, donc jamais au rendu serveur: ce module n'a pas d'état
// qui puisse fuiter d'une requête à l'autre.
let activeId = $state('')

export const adminSubNav = {
	/** Vide tant que l'observateur n'a rien vu: la première section fait alors l'actif. */
	get activeId() {
		return activeId
	},
}

/**
 * Suit le défilement des sections pour désigner l'entrée active du rail. À appeler depuis la
 * page qui les rend — c'est elle qui possède les éléments observés. La liste se passe en
 * fonction: le tableau de bord la dérive de ses données, qui changent à chaque navigation.
 */
export function trackSubNavSections(getSections: () => SubNavSection[]) {
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
			{ rootMargin: '-10% 0px -60% 0px' }
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
}

/** Défilement doux vers une section, sans empiler une entrée d'historique par section visitée. */
export function scrollToSection(event: MouseEvent, id: string) {
	event.preventDefault()
	document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
	replaceState(`#${id}`, {})
}
