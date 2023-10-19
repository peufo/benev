import type { ILimits, CreatePlaceholderArgs } from './type'
import { CLASSNAME_PLACEHOLDER } from './index'

export function getListItemIndex(listElement: HTMLElement, itemEl: HTMLElement) {
	return [...listElement.children].findIndex((item) => item === itemEl)
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

/** Calcule les limites de déplacement supérieur, inférieur et les frontières entre deux items */
export function computeLimits(listElement: HTMLElement, listItemEl: HTMLElement): ILimits | null {
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
