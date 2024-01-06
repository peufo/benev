type Params = {
	trigger: HTMLElement | undefined
	focusIndex?: number
	listQuerySelector?: string
	itemsQuerySelector?: string
	onSelect?: (index: number) => unknown
	onFocus?: (index: number) => unknown
}

export function selector(
	node: HTMLElement,
	{
		trigger,
		focusIndex = -1,
		listQuerySelector = 'ul',
		itemsQuerySelector = 'li',
		onSelect = () => {},
		onFocus = () => {},
	}: Params
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

	trigger?.addEventListener('keydown', handleKeydown)

	return {
		update(params: Partial<Params>) {
			if (params.focusIndex !== undefined) focusIndex = params.focusIndex
			if (params.trigger) {
				trigger?.removeEventListener('keydown', handleKeydown)
				trigger = params.trigger
				trigger?.addEventListener('keydown', handleKeydown)
			}
		},
		destroy() {
			trigger?.removeEventListener('keydown', handleKeydown)
		},
	}
}
