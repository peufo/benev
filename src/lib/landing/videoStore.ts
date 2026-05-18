import { writable, derived } from 'svelte/store'

export const videoVisibilities = writable<Map<number, number>>(new Map())

export const activeVideoIndex = derived(videoVisibilities, ($map) => {
	if ($map.size === 0) return -1
	let maxIndex = -1
	let maxRatio = -1
	$map.forEach((ratio, index) => {
		if (ratio > maxRatio) {
			maxRatio = ratio
			maxIndex = index
		}
	})
	return maxIndex
})

export function reportVisibility(index: number, ratio: number) {
	videoVisibilities.update((map) => {
		if (ratio === 0) {
			map.delete(index)
		} else {
			map.set(index, ratio)
		}
		return map
	})
}
