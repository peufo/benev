import type { ListEditableOptions, CreateMouseMoveOptions } from './type'
import './index.css'
import { CLASSNAME_DRAG_ACTIVE } from './index'
import { initDragStyle, resetDragStyle } from './style'
import { createPlaceholder, computeLimits, getNewOrderIndex, getListItemIndex } from './utils'

type Position = {
	clientX: number
	clientY: number
}

export function createStartHandler<Type = unknown>(
	listElement: HTMLDivElement,
	itemElement: HTMLElement,
	options: ListEditableOptions<Type>
) {
	return (position: Position) => {
		listElement.classList.add(CLASSNAME_DRAG_ACTIVE)
		itemElement.classList.add(CLASSNAME_DRAG_ACTIVE)

		const limits = computeLimits(listElement, itemElement)
		if (!limits) return

		initDragStyle(itemElement)
		const indexFrom = getListItemIndex(listElement, itemElement)
		const placeholder = createPlaceholder({ listElement, itemElement: itemElement, indexFrom })

		let indexTo = indexFrom
		const handleMove = createMoveHandler(
			{ itemElement: itemElement, limits, originMouseY: position.clientY, indexFrom },
			(newIndex) => {
				const { onHover } = options
				indexTo = newIndex
				placeholder.moveTo(indexTo)
				if (onHover) onHover(indexTo)
			}
		)
		const handleTouchMove = (event: TouchEvent) => {
			const position = event.touches[0]
			return handleMove(position)
		}

		const handleEnd = () => {
			const { onMove, onChange, onReindex, items } = options

			document.removeEventListener('mousemove', handleMove)
			document.removeEventListener('touchstart', handleTouchMove)
			document.removeEventListener('mouseup', handleEnd)
			document.removeEventListener('touchend', handleEnd)

			resetDragStyle(itemElement)
			placeholder.remove()
			listElement.classList.remove(CLASSNAME_DRAG_ACTIVE)
			itemElement.classList.remove(CLASSNAME_DRAG_ACTIVE)
			if (indexFrom === indexTo) return
			if (onMove) onMove(indexFrom, indexTo)
			if (onChange || onReindex) {
				const len = limits.items.length
				const newOrderIndex = getNewOrderIndex(len, indexFrom, indexTo)
				if (onReindex) onReindex(newOrderIndex)
				if (onChange) {
					if (!items) console.error('WARNING', 'The option "onChange" require "items"')
					else {
						const newOrderItems = newOrderIndex.map((index) => items![index])
						onChange(newOrderItems)
						options.items = newOrderItems
					}
				}
			}
		}

		document.addEventListener('mousemove', handleMove)
		document.addEventListener('touchstart', handleTouchMove)
		document.addEventListener('mouseup', handleEnd)
		document.addEventListener('touchend', handleEnd)
	}
}

function createMoveHandler(
	{ itemElement, limits, originMouseY, indexFrom }: CreateMouseMoveOptions,
	onHover: (newIndex: number) => void
) {
	let currentIndex = indexFrom

	return (event: Position) => {
		if (!itemElement || !limits || !originMouseY) return
		let deltaMouseY = event.clientY - originMouseY
		if (deltaMouseY < limits.top) deltaMouseY = limits.top
		if (deltaMouseY > limits.bottom) deltaMouseY = limits.bottom

		itemElement.style.transform = `translateY(${deltaMouseY}px)`

		const newIndex = limits.items.findIndex((center) => deltaMouseY <= center)

		if (newIndex !== currentIndex) {
			currentIndex = newIndex
			onHover(newIndex)
		}
	}
}
