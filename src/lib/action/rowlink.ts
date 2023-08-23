export function rowLink(node: HTMLTableRowElement, href: string) {
	const cells = node.querySelectorAll('td')
	cells.forEach((cell) => {
		const a = document.createElement('a')
		a.href = href
		a.innerHTML = '<span class="absolute inset-0"> </span>'
		cell.classList.add('relative')
		if (cell.dataset['prepend']) cell.prepend(a)
		else cell.append(a)
	})
}
