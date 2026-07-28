import { browser } from '$app/environment'
import { readable } from 'svelte/store'

const getValue = () => browser && document.body.clientWidth < 600

export const isSmallScreen = readable<boolean>(getValue(), (set) => {
	if (!browser) return
	const update = () => {
		set(getValue())
	}
	window.addEventListener('resize', update)
	return () => {
		window.removeEventListener('resize', update)
	}
})
