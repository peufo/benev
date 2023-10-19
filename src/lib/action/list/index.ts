import { createDragHandler } from './handlers'
import { dragHandler } from './utils'

export const CLASSNAME_LIST = 'editable-list'
export const CLASSNAME_DRAG_ACTIVE = 'drag-active'
export const CLASSNAME_PLACEHOLDER = 'item-placholder'

export interface ListEditableOptions<Type = unknown> {
	onHover?: (newOrder: number[]) => void
	onMove?: (indexFrom: number, indexTo: number) => void
	/** Déclencher quand l'ordre change. newOrder est un tableau d'index */
	onReindex?: (newOrder: number[]) => void
	/** Déclencher quand l'ordre change. newOrder est les items fournit réordonné */
	onChange?: (newOrder: Type[]) => void
	/** Fournir les items pour directement récupérer la liste à jour dans onChange */
	items?: Type[]
	onDelete?: (index: number, items?: Type[]) => void

	/** Only handle reorder from this elements */
	dragElementsSelector?: string
}

export function listEditable<Type = unknown>(
	node: HTMLDivElement,
	options: ListEditableOptions<Type> = {}
) {
	const { dragElementsSelector } = options
	node.classList.add(CLASSNAME_LIST)

	const itemElements = [...node.children] as HTMLElement[]
	const dragElements = [
		...(dragElementsSelector ? node.querySelectorAll(dragElementsSelector) : itemElements),
	] as HTMLElement[]

	const listeners = dragElements.map((dragElement, index) =>
		dragHandler(dragElement, createDragHandler(node, itemElements[index], options))
	)

	return {
		destroy() {
			node?.classList.remove(CLASSNAME_LIST)
			listeners.forEach((listener) => listener.detroy())
		},
	}
}
