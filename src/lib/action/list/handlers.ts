import './index.css'
import { CLASSNAME_DRAG_ACTIVE, type ListEditableOptions } from './index'
import { initDragStyle, resetDragStyle } from './style'
import {
	createPlaceholder,
	computeLimits,
	getNewOrderIndex,
	getListItemIndex,
	type Limits,
} from './utils'
import { scroll } from './store'

export type Position = {
	clientX: number
	clientY: number
}

export type DragHandler = ReturnType<typeof createDragHandler>

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
	let currentPosition: Position = { clientX: 0, clientY: 0 }

	const events = createEventEmitter<'dragStart' | 'dragMove' | 'dragEnd'>({
		dragStart: options.onDragStart ? [options.onDragStart] : [],
		dragMove: options.onDragMove ? [options.onDragMove] : [],
		dragEnd: options.onDragEnd ? [options.onDragEnd] : [],
	})

	return {
		on: events.on,
		off: events.off,
		start(position: Position) {
			events.emit('dragStart')
			currentPosition = position
			limits = computeLimits(listElement, itemElement)
			if (!limits) return

			originMouseY = position.clientY + scroll.top

			listElement.classList.add(CLASSNAME_DRAG_ACTIVE)
			itemElement.classList.add(CLASSNAME_DRAG_ACTIVE)
			initDragStyle(itemElement)
			indexFrom = getListItemIndex(listElement, itemElement)
			indexTo = indexFrom
			placeholder = createPlaceholder({ listElement, itemElement, indexFrom })
		},
		move(position: Position = currentPosition) {
			events.emit('dragMove')
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
		},
		end() {
			events.emit('dragEnd')
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
		},
	}
}

type Callback = () => void
function createEventEmitter<EventName extends string>(
	initialEvents: Record<EventName, Callback[]>
) {
	const events = { ...initialEvents }
	return {
		on(event: EventName, callback: Callback) {
			events[event].push(callback)
		},
		off(event: EventName, callback: Callback) {
			const index = events[event].indexOf(callback)
			events[event].splice(index, 1)
		},
		emit(event: EventName) {
			events[event].forEach((callback) => callback())
		},
	}
}
