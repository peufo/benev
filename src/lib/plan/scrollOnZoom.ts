import { ctrl } from '$lib/store'
import { tick } from 'svelte'
import { get } from 'svelte/store'

const SCALE_MIN = 5
const SCALE_MAX = 100

type scrollOnWheelOptions = {
	scaleX?: number
	scaleY?: number
	marginX?: number
	marginY?: number
	onZoom: (zoom: { scaleX: number; scaleY: number }) => void
}

/** Ensure the scroll keep center when the zoom change */
export function scrollOnZoom(
	node: HTMLElement,
	{
		scaleX: currentScaleX = 1,
		scaleY: currentScaleY = 1,
		marginX = 0,
		marginY = 0,
		onZoom,
	}: scrollOnWheelOptions
) {
	let cursorX: number | null = null
	let cursorY: number | null = null

	async function updateScroll({ scaleX = 1, scaleY = 1 }: scrollOnWheelOptions) {
		const offsetX = cursorX ?? node.clientWidth / 2
		const offsetY = cursorY ?? node.clientHeight / 2

		const centerX = node.scrollLeft + offsetX
		const centerY = node.scrollTop + offsetY

		const ratioX = scaleX / currentScaleX
		const ratioY = scaleY / currentScaleY
		currentScaleX = scaleX
		currentScaleY = scaleY

		const left = centerX * ratioX - offsetX
		const top = centerY * ratioY - offsetY
		await tick()
		node.scrollTo({ top, left, behavior: 'instant' })
	}

	function onMouseMove({ clientX, clientY }: MouseEvent) {
		cursorX = clientX - node.offsetLeft - marginX
		cursorY = clientY - node.offsetTop - marginY
	}

	function onMouseLeave() {
		cursorX = null
		cursorY = null
	}

	function onWheel(event: WheelEvent) {
		if (!get(ctrl)) return
		event.preventDefault()
		const scaleX = getNextScale(currentScaleX, event.deltaY)
		const scaleY = getNextScale(currentScaleY, event.deltaY)
		onZoom({ scaleX, scaleY })
	}

	function getNextScale(scale: number, delta: number) {
		const nextScale = scale - delta / 20
		if (nextScale < SCALE_MIN) return SCALE_MIN
		else if (nextScale > SCALE_MAX) SCALE_MAX
		return nextScale
	}

	node.addEventListener('mousemove', onMouseMove)
	node.addEventListener('mouseleave', onMouseLeave)
	node.addEventListener('wheel', onWheel)

	return {
		update: updateScroll,
		destroy() {
			node.removeEventListener('mousemove', onMouseMove)
			node.removeEventListener('mouseleave', onMouseLeave)
			node.removeEventListener('wheel', onWheel)
		},
	}
}
