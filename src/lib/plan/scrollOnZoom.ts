import { tick } from 'svelte'
import { debounce } from '$lib/debounce'
import { clampScale, markZoomScroll } from './zoom'

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

	/**
	 * Les indicateurs qui suivent le curseur se replacent sur l'évènement `scroll`, que le
	 * navigateur ne dispatche qu'au frame suivant: le temps du geste, ils décrocheraient de la
	 * grille redessinée. On les efface plutôt que de les recaler, et ils reviennent en place une
	 * fois l'échelle stabilisée. Le délai n'a qu'à dépasser l'espacement des crans d'un même geste,
	 * sans quoi ils clignoteraient en plein zoom.
	 */
	const endZoom = debounce(() => node.classList.remove('zooming'), 200)

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
		markZoomScroll()
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
		// L'état lu sur l'évènement, et non un store clavier: il est exact même quand la touche
		// était déjà enfoncée à l'arrivée sur la page. Le pincement du trackpad le pose aussi,
		// et zoome donc le plan plutôt que la page.
		if (!event.ctrlKey && !event.metaKey) return
		event.preventDefault()
		node.classList.add('zooming')
		endZoom()
		onZoom({
			scaleX: clampScale(currentScaleX - event.deltaY / 20),
			scaleY: clampScale(currentScaleY - event.deltaY / 20),
		})
	}

	node.addEventListener('mousemove', onMouseMove)
	node.addEventListener('mouseleave', onMouseLeave)
	node.addEventListener('wheel', onWheel, { passive: false })

	return {
		update: updateScroll,
		destroy() {
			node.removeEventListener('mousemove', onMouseMove)
			node.removeEventListener('mouseleave', onMouseLeave)
			node.removeEventListener('wheel', onWheel)
		},
	}
}
