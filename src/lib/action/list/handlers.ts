import './index.css'
import { CLASSNAME_DRAG_ACTIVE, type ListEditableOptions } from './index'
import { initDragStyle, resetDragStyle } from './style'
import {
	createPlaceholder,
	computeLimits,
	getNewOrderIndex,
	getListItemIndex,
	type Position,
	type Limits,
} from './utils'
import { scroll } from './scroll'

export function createDragHandler<Type = unknown>(
	listElement: HTMLDivElement,
	itemElement: HTMLElement,
	options: ListEditableOptions<Type>
) {
	let originMouseY = 0
	let limits: Limits | null = null
	let placeholder: ReturnType<typeof createPlaceholder> | null = null
	let indexFrom = 0
	let indexTo = 0

	const scrollContainer = listElement.parentElement!
	let currentPosition: Position = { clientX: 0, clientY: 0 }
	const update = () => {
		scroll.top = scrollContainer.scrollTop
		move()
	}

	function start(position: Position) {
		currentPosition = position
		limits = computeLimits(listElement, itemElement)
		if (!limits) return
		if (options.onDragStart) options.onDragStart()

		originMouseY = position.clientY + scroll.top
		scrollContainer.addEventListener('scroll', update)

		listElement.classList.add(CLASSNAME_DRAG_ACTIVE)
		itemElement.classList.add(CLASSNAME_DRAG_ACTIVE)
		initDragStyle(itemElement)
		indexFrom = getListItemIndex(listElement, itemElement)
		indexTo = indexFrom
		placeholder = createPlaceholder({ listElement, itemElement, indexFrom })
	}

	function move(position: Position = currentPosition) {
		currentPosition = position
		if (!itemElement || !limits || !originMouseY) return
		let deltaMouseY = position.clientY - originMouseY + scroll.top
		if (deltaMouseY < limits.top) deltaMouseY = limits.top
		if (deltaMouseY > limits.bottom) deltaMouseY = limits.bottom

		itemElement.style.transform = `translateY(${deltaMouseY}px)`
		const newIndex = limits.items.findIndex((center) => deltaMouseY <= center)

		if (newIndex !== indexTo) {
			indexTo = newIndex
			placeholder?.moveTo(indexTo)
		}
	}
	function end() {
		if (options.onDragEnd) options.onDragEnd()
		scrollContainer.removeEventListener('scroll', update)
		resetDragStyle(itemElement)
		placeholder?.remove()
		listElement.classList.remove(CLASSNAME_DRAG_ACTIVE)
		itemElement.classList.remove(CLASSNAME_DRAG_ACTIVE)
		if (indexFrom === indexTo) return
		if (!limits?.items) return
		const len = limits.items.length
		const newOrderIndex = getNewOrderIndex(len, indexFrom, indexTo)
		if (options.onReindex) options.onReindex(newOrderIndex)

		if (options.onChange) {
			if (!options.items) {
				console.error('WARNING', 'The option "onChange" require "items"')
				return
			}
			const newOrderItems = newOrderIndex.map((index) => options.items![index])
			options.onChange(newOrderItems)
			options.items = newOrderItems
		}
	}

	return { start, move, end }
}
