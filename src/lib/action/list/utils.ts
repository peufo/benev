import { CLASSNAME_PLACEHOLDER } from './index'

export function getListItemIndex(listElement: HTMLElement, itemEl: HTMLElement) {
	return [...listElement.children].findIndex((item) => item === itemEl)
}

export interface CreatePlaceholderArgs {
	listElement: HTMLElement
	itemElement: HTMLElement
	indexFrom: number
}
export function createPlaceholder({ listElement, itemElement, indexFrom }: CreatePlaceholderArgs) {
	const itemsEl = [...listElement.children]
	const placeholderEl = document.createElement('div')

	placeholderEl.classList.add(CLASSNAME_PLACEHOLDER)
	placeholderEl.style.height = `${itemElement.offsetHeight}px`
	listElement.insertBefore(placeholderEl, itemElement)

	const moveTo = (index: number) => {
		const selectorIndex = index < indexFrom ? index : index + 1
		const itemEl = itemsEl[selectorIndex]
		listElement.insertBefore(placeholderEl, itemEl)
	}
	return {
		moveTo,
		remove() {
			const parent = placeholderEl.parentNode
			parent?.removeChild(placeholderEl)
			placeholderEl.remove()
		},
	}
}

export interface Limits {
	top: number
	bottom: number
	items: number[]
}
/** Calcule les limites de déplacement supérieur, inférieur et les frontières entre deux items */
export function computeLimits(listElement: HTMLElement, listItemEl: HTMLElement): Limits | null {
	const rect = listItemEl.getBoundingClientRect()
	const itemsRect = [...listElement.children]
		.filter((el) => !el.classList.contains(CLASSNAME_PLACEHOLDER))
		.map((el) => el.getBoundingClientRect())

	const tops = itemsRect.map((item) => item.top - rect.top)
	const bottoms = itemsRect.map((item) => item.bottom - rect.bottom)
	const items = itemsRect
		.map((item, index, self) => {
			if (index === self.length - 1) return false
			if (tops[index] < 0) return tops[index] + item.height / 2
			return bottoms[index] + self[index + 1].height / 2
		})
		.filter((v) => v !== false) as number[]
	items.push(Infinity)
	return {
		top: tops[0],
		bottom: bottoms[bottoms.length - 1],
		items,
	}
}

export function getNewOrderIndex(len: number, indexFrom: number, indexTo: number): number[] {
	const [start, end] = [indexFrom, indexTo].sort((a, b) => a - b)
	const arr = Array(len)
		.fill(null)
		.map((_, i) => i)
	const arrStart = arr.slice(0, start)
	const arrEnd = arr.slice(end + 1)
	const arrMove = arr.slice(start, end + 1)
	if (indexFrom < indexTo) {
		arrMove.shift()
		arrMove.push(indexFrom)
	} else {
		arrMove.pop()
		arrMove.unshift(indexFrom)
	}
	const newOrder = [...arrStart, ...arrMove, ...arrEnd]

	return newOrder
}

export type Position = {
	clientX: number
	clientY: number
}

type DragEvent = {
	start: (position: Position) => any
	move: (position: Position) => any
	end: () => any
}

/** Gestion du cycle de vie des évènements de la souris */
export function mouseDragHandler(element: HTMLElement, handlers: DragEvent) {
	function startHandler(event: MouseEvent) {
		handlers.start(event)
		document.addEventListener('mousemove', handlers.move)
		document.addEventListener('mouseup', endHandler)
	}

	function endHandler() {
		document.removeEventListener('mousemove', handlers.move)
		document.removeEventListener('mouseup', endHandler)
		handlers.end()
	}

	function stopPropagation(event: Event) {
		event.stopPropagation()
	}

	element.addEventListener('mousedown', startHandler)
	element.addEventListener('click', stopPropagation)

	return {
		detroy() {
			document.removeEventListener('mousedown', startHandler)
			document.removeEventListener('mousemove', handlers.move)
			document.removeEventListener('mouseup', endHandler)
			element.removeEventListener('click', stopPropagation)
		},
	}
}

/** Gestion du cycle de vie des évènements de la souris */
export function touchDragHandler(element: HTMLElement, handlers: DragEvent) {
	let onDrag = false

	function startHandler(event: TouchEvent) {
		onDrag = true
		handlers.start(event.touches[0])
	}

	function moveHandler(event: TouchEvent) {
		if (!onDrag) return
		event.preventDefault()
		handlers.move(event.touches[0])
	}

	function endHandler() {
		onDrag = false
		handlers.end()
	}

	function stopPropagation(event: Event) {
		event.stopPropagation()
	}

	element.addEventListener('touchstart', startHandler)
	element.addEventListener('touchmove', moveHandler)
	element.addEventListener('touchend', endHandler)
	element.addEventListener('click', stopPropagation)

	return {
		detroy() {
			element.removeEventListener('touchstart', startHandler)
			element.removeEventListener('touchmove', moveHandler)
			element.removeEventListener('touchend', endHandler)
			element.removeEventListener('click', stopPropagation)
		},
	}
}
