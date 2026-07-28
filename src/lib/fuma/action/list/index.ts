import { createDragHandler } from '$lib/fuma/action/list/handlers.js'
import { mouseDragTrigger, touchDragTrigger, scrollTrigger } from '$lib/fuma/action/list/trigger.js'

export const CLASSNAME_LIST = 'editable-list'
export const CLASSNAME_DRAG_ACTIVE = 'drag-active'
export const CLASSNAME_PLACEHOLDER = 'item-placeholder'

export interface ListEditableOptions<Type = unknown> {
	onDragStart?: () => void
	onDragMove?: () => void
	onDragEnd?: () => void
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
	node: HTMLDivElement | HTMLUListElement,
	options: ListEditableOptions<Type> = {}
) {
	const { dragElementsSelector } = options
	node.classList.add(CLASSNAME_LIST)

	let mouseListeners: { destroy: () => void }[] = []
	let touchListeners: { destroy: () => void }[] = []
	let scrollListeners: { destroy: () => void }[] = []
	createListeners()

	function createListeners() {
		const itemElements = [...node.children] as HTMLElement[]
		const dragElements = [
			...(dragElementsSelector ? node.querySelectorAll(dragElementsSelector) : itemElements),
		] as HTMLElement[]

		const dragHandlers = dragElements.map((d, index) =>
			createDragHandler(node, itemElements[index], options)
		)

		mouseListeners = dragElements.map((dragElement, index) =>
			mouseDragTrigger(dragElement, dragHandlers[index])
		)
		touchListeners = dragElements.map((dragElement, index) =>
			touchDragTrigger(dragElement, dragHandlers[index])
		)

		const scrollContainer = node.parentElement
		if (scrollContainer) {
			scrollListeners = dragHandlers.map((handler) => scrollTrigger(handler, scrollContainer))
		}
	}

	function removeListeners() {
		mouseListeners.forEach((listener) => listener.destroy())
		touchListeners.forEach((listener) => listener.destroy())
		scrollListeners.forEach((listener) => listener.destroy())
	}

	return {
		destroy() {
			node?.classList.remove(CLASSNAME_LIST)
			removeListeners()
		},
		update({ items }: ListEditableOptions<Type>) {
			if (items?.length !== options.items?.length) {
				removeListeners()
				createListeners()
			}
			options.items = items
		},
	}
}
