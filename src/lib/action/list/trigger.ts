import type { DragHandler } from './handlers'
import { scroll } from './store'

/** Gestion du cycle de vie des évènements de la souris */
export function mouseDragTrigger(element: HTMLElement, handler: DragHandler) {
	function startHandler(event: MouseEvent) {
		handler.start(event)
		document.addEventListener('mousemove', handler.move)
		document.addEventListener('mouseup', endHandler, { once: true })
	}

	function endHandler() {
		document.removeEventListener('mousemove', handler.move)
		handler.end()
	}

	function stopPropagation(event: Event) {
		event.stopPropagation()
	}

	element.addEventListener('mousedown', startHandler)
	element.addEventListener('click', stopPropagation)

	return {
		destroy() {
			element?.removeEventListener('mousedown', startHandler)
			element?.removeEventListener('click', stopPropagation)
			document.removeEventListener('mousemove', handler.move)
			document.removeEventListener('mouseup', endHandler)
		},
	}
}

/** Gestion du cycle de vie des évènements de la souris */
export function touchDragTrigger(element: HTMLElement, handler: DragHandler) {
	let onDrag = false

	function startHandler(event: TouchEvent) {
		onDrag = true
		handler.start(event.touches[0])
	}

	function moveHandler(event: TouchEvent) {
		if (!onDrag) return
		event.preventDefault()
		handler.move(event.touches[0])
	}

	function endHandler() {
		onDrag = false
		handler.end()
	}

	function stopPropagation(event: Event) {
		event.stopPropagation()
	}

	element.addEventListener('touchstart', startHandler)
	element.addEventListener('touchmove', moveHandler)
	element.addEventListener('touchend', endHandler)
	element.addEventListener('click', stopPropagation)

	return {
		destroy() {
			if (!element) return
			element.removeEventListener('touchstart', startHandler)
			element.removeEventListener('touchmove', moveHandler)
			element.removeEventListener('touchend', endHandler)
			element.removeEventListener('click', stopPropagation)
		},
	}
}

export function scrollTrigger(handler: DragHandler, scrollContainer: Element) {
	let listeners: { destroy: () => void }[] = []

	let mousePosition = { clientX: 0, clientY: 0 }
	let containerRect = { top: 0, bottom: 0 }

	function createScrollListener() {
		const scrollHandler = () => {
			scroll.top = scrollContainer.scrollTop
			handler.move()
			scrollOnTheEdge()
		}
		scrollContainer.addEventListener('scroll', scrollHandler)
		return {
			destroy() {
				scrollContainer.removeEventListener('scroll', scrollHandler)
			},
		}
	}

	function createMouseListener() {
		const mouseMoveHandler = ({ clientX, clientY }: MouseEvent) => {
			mousePosition = { clientX, clientY }
			scrollOnTheEdge()
		}
		document.addEventListener('mousemove', mouseMoveHandler)
		return {
			destroy() {
				document.removeEventListener('mousemove', mouseMoveHandler)
			},
		}
	}

	const EDGE_SCROLL_ZONE = 0
	const SCROLL_INCREMENT = 3
	function scrollOnTheEdge() {
		const { top, bottom } = containerRect
		const { clientY } = mousePosition
		const isOnTop = top + EDGE_SCROLL_ZONE > clientY
		const isOnBottom = bottom - EDGE_SCROLL_ZONE < clientY
		const { scrollTop, scrollHeight } = scrollContainer

		if (isOnTop && scrollTop - SCROLL_INCREMENT > 0) {
			scrollContainer.scrollTo({ top: scrollTop - SCROLL_INCREMENT })
		} else if (
			isOnBottom &&
			scrollContainer.scrollTop + SCROLL_INCREMENT < scrollTop + scrollHeight
		) {
			scrollContainer.scrollTo({ top: scrollTop + SCROLL_INCREMENT })
		}
	}

	function dragStart() {
		containerRect = scrollContainer.getBoundingClientRect()
		listeners = [createScrollListener(), createMouseListener()]
	}
	function dragEnd() {
		listeners.forEach(({ destroy }) => destroy())
		listeners = []
	}

	handler.on('dragStart', dragStart)
	handler.on('dragEnd', dragEnd)

	return {
		destroy() {
			handler.off('dragStart', dragStart)
			handler.off('dragEnd', dragEnd)
			listeners.forEach(({ destroy }) => destroy())
		},
	}
}
