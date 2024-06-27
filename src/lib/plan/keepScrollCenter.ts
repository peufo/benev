import { tick } from 'svelte'

type KeepScrollCenterOptions = {
	scaleX?: number
	scaleY?: number
}

/** Ensure the scroll keep center when the zoom change */
export function keepScrollCenter(node: HTMLElement, options: KeepScrollCenterOptions) {
	let currentScaleX = options.scaleX || 1
	let currentScaleY = options.scaleY || 1

	async function updateScroll({ scaleX = 1, scaleY = 1 }: KeepScrollCenterOptions) {
		const { scrollTop, clientHeight, scrollLeft, clientWidth } = node

		const offsetX = clientWidth / 2
		const offsetY = clientHeight / 2

		const centerX = scrollLeft + offsetX
		const centerY = scrollTop + offsetY

		const ratioX = scaleX / currentScaleX
		const ratioY = scaleY / currentScaleY
		currentScaleX = scaleX
		currentScaleY = scaleY

		const left = centerX * ratioX - offsetX
		const top = centerY * ratioY - offsetY
		await tick()
		node.scrollTo({ top, left, behavior: 'instant' })
	}

	return {
		update: updateScroll,
	}
}
