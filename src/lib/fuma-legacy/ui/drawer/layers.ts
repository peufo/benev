import { derived, writable, type Readable } from 'svelte/store'
import { page } from '$app/stores'
import { browser } from '$app/environment'

const layers = writable<string[]>([])
const layersOffset = derived<Readable<string[]>, Record<string, number>>(layers, ($layers) => {
	const nbDrawer = $layers.length
	return $layers.reduce((acc, layer, index) => {
		const drawerOffset = nbDrawer - index - 1
		return { ...acc, [layer]: drawerOffset }
	}, {})
})

export function subscibeDrawerLayers(key: string) {
	const layerId = Math.random().toString().slice(2, 12)
	let isInitialized = false
	const isActive = derived(page, ({ url }) => url.searchParams.has(key), false)
	const isActiveUnsubscribe = isActive.subscribe(($isActive) => {
		if ($isActive) addLayer()
		else if (isInitialized) removeLayer()
		isInitialized = true
	})

	function addLayer() {
		layers.update(($layers) => {
			if ($layers.length === 0) hideRootScrollBar()
			return [...$layers, layerId]
		})
	}

	function removeLayer() {
		layers.update(($layers) => {
			if (!$layers.length) return $layers
			if ($layers.length === 1) {
				restoreRootScrollBar()
				return []
			}
			const index = $layers.indexOf(layerId)
			return $layers.toSpliced(index, 1)
		})
	}

	return {
		isActive,
		index: derived(layers, ($layers) => $layers.indexOf(layerId)),
		offset: derived(layersOffset, (offsets) => offsets[layerId]),
		destroy() {
			removeLayer()
			isActiveUnsubscribe()
		},
	}
}

function hideRootScrollBar() {
	if (!browser) return
	const root = document.documentElement
	const scrollbarWidth = window.innerWidth - root.offsetWidth
	if (!scrollbarWidth) return
	root.style.scrollbarWidth = 'none'
	root.style.paddingRight = `${scrollbarWidth}px`
}

function restoreRootScrollBar() {
	if (!browser) return
	const root = document.documentElement
	root.style.scrollbarWidth = ''
	root.style.paddingRight = ''
}
