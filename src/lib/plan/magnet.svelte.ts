import { browser } from '$app/environment'
import { time } from './utils'

// La touche modificatrice est un état global du document: un `$state` de module suffit,
// plus besoin d'un store ni de son abonnement.
let isCtrlDown = $state(false)

if (browser) {
	const update = (event: KeyboardEvent) => {
		isCtrlDown = event.ctrlKey || event.metaKey
	}
	document.addEventListener('keydown', update)
	document.addEventListener('keyup', update)
}

/** Arrondit une durée au quart d'heure, ou à la minute tant que ctrl/cmd est enfoncé. */
export const magnet = (ms: number) => time(ms).roundBy(isCtrlDown ? 1 : 15, 'minute')
