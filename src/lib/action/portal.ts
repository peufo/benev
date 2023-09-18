export function portal(node: HTMLElement, selector: string) {
	const target = document.querySelector(selector)
	if (!target) throw `tagret not found for selector "${selector}"`

	target.appendChild(node)
	return {
		destroy: () => node.remove(),
	}
}
