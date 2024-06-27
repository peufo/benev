import { browser } from '$app/environment'
import { readable } from 'svelte/store'

export const ctrl = readable(false, (set) => {
	if (!browser) return
	function onKeyDown(event: KeyboardEvent) {
		set(event.ctrlKey || event.metaKey)
	}
	function onKeyUp(event: KeyboardEvent) {
		set(event.ctrlKey || event.metaKey)
	}
	document.addEventListener('keydown', onKeyDown)
	document.addEventListener('keyup', onKeyUp)
	return () => {
		document.removeEventListener('keypress', onKeyDown)
		document.removeEventListener('keyup', onKeyDown)
	}
})
