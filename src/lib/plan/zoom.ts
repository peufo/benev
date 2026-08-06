import { goto } from '$app/navigation'
import { debounce } from '$lib/debounce'
import { urlParam } from 'fuma'
import type { Plan } from './types'

export const SCALE_MIN = 5
export const SCALE_MAX = 100

export function clampScale(scale: number) {
	return Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale))
}

/**
 * Rend un plan à la nouvelle échelle. `getPlan` produit un objet nu, dont les propriétés ne sont
 * pas réactives: seul le remplacement du dérivé redessine la grille. Muter `plan.hourSize` ne
 * notifierait personne.
 */
export function withHourSize(plan: Plan, hourSize: number): Plan {
	return {
		...plan,
		hourSize,
		length: plan.days.reduce((acc, { hours }) => acc + hours.length, 0) * hourSize,
	}
}

let zoomScrollPending = false

/** Le zoom recentre la vue sur le curseur: le défilement qui en découle n'est pas un geste. */
export function markZoomScroll() {
	zoomScrollPending = true
}

/**
 * Vrai une seule fois par recentrage. Sans ça, dézoomer au maximum atteint les deux bords de la
 * plage et déclencherait une navigation du curseur.
 */
export function consumeZoomScroll() {
	const pending = zoomScrollPending
	zoomScrollPending = false
	return pending
}

/**
 * L'échelle vit d'abord côté client; l'URL n'en garde qu'une trace, pour le rechargement et le
 * partage. Le `load` du plan lit `hourSize` hors suivi (voir `getPlanData`), sinon chaque cran
 * rejouerait les requêtes de la page la plus lourde de l'application.
 */
export const persistHourSize = debounce((hourSize: number) => {
	goto(urlParam.with({ hourSize: Math.round(hourSize * 100) / 100 }), {
		replaceState: true,
		noScroll: true,
		keepFocus: true,
	})
}, 300)
