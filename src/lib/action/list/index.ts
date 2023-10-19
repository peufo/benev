import type { ListEditableOptions } from './type'
import { createMouseDownHandler } from './handlers'

export * from './type'
export const CLASSNAME_LIST = 'editable-list'
export const CLASSNAME_DRAG_ACTIVE = 'drag-active'
export const CLASSNAME_PLACEHOLDER = 'item-placholder'
export const CLASSNAME_DELETE = 'item-delete'

export function listEditable<Type = unknown>(
	node: HTMLDivElement,
	options: ListEditableOptions<Type> = {}
) {
	const { onDelete, items, dragElementsSelector } = options
	node.classList.add(CLASSNAME_LIST)
	const itemElements = Array.from(node.children) as HTMLElement[]
	const dragElements = Array.from(
		dragElementsSelector ? node.querySelectorAll(dragElementsSelector) : itemElements
	) as HTMLElement[]

	const mouseDownHandlers = itemElements.map((itemElement) =>
		createMouseDownHandler<Type>(node, itemElement, options)
	)
	dragElements.forEach((element, index) => {
		element.addEventListener('mousedown', mouseDownHandlers[index])
	})

	// Stop la propagation du click si l'activateur est un sous élément
	const stopPropagation = (event: MouseEvent) => event.stopPropagation()
	if (dragElementsSelector) {
		dragElements.forEach((el) => el.addEventListener('click', stopPropagation))
	}

	const deleteButtons = node.querySelectorAll(CLASSNAME_DELETE)
	const deleteButtonHandlers: ((event: Event) => void)[] = []
	deleteButtons.forEach((button, index) => {
		const handler = (event: Event) => {
			event.stopPropagation()
			if (onDelete) onDelete(index, items)
		}
		button.addEventListener('mousedown', handler)
		deleteButtonHandlers.push(handler)
	})

	return {
		destroy() {
			node?.classList.remove(CLASSNAME_LIST)
			dragElements.forEach((element, index) => {
				element.removeEventListener('mousedown', mouseDownHandlers[index])
			})
			if (dragElementsSelector) {
				dragElements.forEach((el) => el.removeEventListener('click', stopPropagation))
			}

			deleteButtonHandlers.forEach((handler, index) => {
				deleteButtons[index].removeEventListener('mousedown', handler)
			})
		},
	}
}
