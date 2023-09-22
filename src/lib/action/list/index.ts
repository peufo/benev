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
	const { onDelete, items } = options

	const mouseDownHandler = createMouseDownHandler<Type>(node, options)

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

	node.classList.add(CLASSNAME_LIST)
	node.addEventListener('mousedown', mouseDownHandler)

	return {
		destroy() {
			if (node) {
				node.classList.remove(CLASSNAME_LIST)
				node.removeEventListener('mousedown', mouseDownHandler)
			}
			deleteButtonHandlers.forEach((handler, index) => {
				deleteButtons[index].removeEventListener('mousedown', handler)
			})
		},
	}
}
