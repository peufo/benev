type Params = {
	trigger?: HTMLInputElement | HTMLButtonElement
	listQuerySelector: string
	itemsQuerySelector: string
	focusIndex: number
	onSelect: (index: number) => unknown
	onFocus: (index: number) => unknown
}

export function selector(
	node: HTMLElement,
	{
		trigger,
		listQuerySelector = 'ul',
		itemsQuerySelector = 'li',
		focusIndex = -1,
		onSelect = () => {},
		onFocus = () => {},
	}: Partial<Params> = {}
) {
	function handleKeydown(event: KeyboardEvent) {
		const items = node.querySelectorAll<HTMLElement>(itemsQuerySelector)
		if (event.key === 'Enter') {
			event.preventDefault()
			onSelect(focusIndex)
			return
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault()
			focusIndex--
			if (focusIndex < 0) focusIndex = items.length - 1
			onFocus(focusIndex)
			scrollToSelected(items)
			return
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			focusIndex++
			if (focusIndex > items.length - 1) focusIndex = 0
			onFocus(focusIndex)
			scrollToSelected(items)
			return
		}
	}

	function scrollToSelected(items: NodeListOf<HTMLElement>) {
		const list = node.tagName === 'UL' ? node : node.querySelector<HTMLElement>(listQuerySelector)
		if (!(list instanceof HTMLElement)) {
			console.error('wrapper element not found')
			return
		}
		const item = items[focusIndex]
		if (!item) return
		const top = item.offsetTop - 4
		if (top < list.scrollTop) {
			list.scrollTo({ top })
			return
		}
		const bottom = item.offsetTop + item.offsetHeight
		const delta = bottom - (list.scrollTop + list.offsetHeight) + 10
		if (delta > 0) {
			list.scrollTo({ top: list.scrollTop + delta })
			return
		}
	}

	let triggerElement = (trigger || document) as HTMLInputElement
	triggerElement.addEventListener('keydown', handleKeydown)

	return {
		update(params: Partial<Params>) {
			if (params.focusIndex) focusIndex = params.focusIndex
			if (params.trigger) {
				triggerElement.removeEventListener('keydown', handleKeydown)
				triggerElement = (params.trigger || document) as HTMLInputElement
				triggerElement.addEventListener('keydown', handleKeydown)
			}
		},
		destroy() {
			triggerElement.removeEventListener('keydown', handleKeydown)
		},
	}
}
