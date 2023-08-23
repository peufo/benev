type Option = {
	href: string
	enable?: boolean
	addRowClasses?: boolean
}

export function rowLink(
	row: HTMLTableRowElement,
	{ href, enable = true, addRowClasses = true }: Option
) {
	if (!enable) return
	if (addRowClasses) row.classList.add('hover', 'cursor-pointer')

	row.childNodes.forEach((node) => {
		const cell = getCell(node)
		if (!cell) return
		const a = document.createElement('a')
		a.href = href
		a.innerHTML = '<span class="absolute inset-0"> </span>'

		cell.classList.add('relative')
		if (cell.dataset['prepend'] !== undefined) cell.prepend(a)
		else cell.append(a)
	})
}

function getCell(node: ChildNode): HTMLTableCellElement | null {
	if (node.nodeName !== 'TD') return null
	return node as HTMLTableCellElement
}
