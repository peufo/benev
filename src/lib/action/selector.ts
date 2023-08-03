type Params = {
	inputQuerySelector: string
	listQuerySelector: string
	itemsQuerySelector: string
	focusIndex: number
	onSelect: (index: number) => unknown
	onFocus: (index: number) => unknown
}

export function selector(
	node: HTMLElement,
	{
		inputQuerySelector = 'input[type=text]',
		listQuerySelector = 'ul',
		itemsQuerySelector = 'li',
		focusIndex = -1,
		onSelect = () => {},
		onFocus = () => {},
	}: Partial<Params> = {}
) {
	const input = node.querySelector<HTMLInputElement>(inputQuerySelector)
	if (!(input instanceof HTMLInputElement)) {
		console.error('input element not found or is not an  HTMLInputElement')
		return
	}

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
		const list = node.querySelector<HTMLElement>(listQuerySelector)
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

	input.addEventListener('keydown', handleKeydown)

	console.log(input)

	return {
		update(params: { focusIndex: number }) {
			focusIndex = params.focusIndex
		},
		destroy() {
			input.removeEventListener('keydown', handleKeydown)
		},
	}
}
