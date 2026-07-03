export function usePositionIndicator(axis: 'x' | 'y') {
	const indicators = new Set<HTMLElement>()

	return {
		container(node: HTMLDivElement) {
			const mousePosition = { x: 0, y: 0 }

			function trackMousePosition(event: MouseEvent) {
				const clientRect = node.getClientRects().item(0) || { x: 0, y: 0 }
				mousePosition.x = event.x - clientRect.x
				mousePosition.y = event.y - clientRect.y
				updateIndicators()
			}

			function updateIndicators() {
				for (const indicator of indicators.values()) {
					indicator.style.display = 'block'
					if (axis === 'x') {
						const positionX = node.scrollLeft + mousePosition.x - indicator.offsetWidth / 2
						indicator.style.translate = `${positionX}px 0px`
					} else {
						const positionY = node.scrollTop + mousePosition.y - indicator.offsetHeight / 2
						indicator.style.translate = `0px ${positionY}px`
					}
				}
			}

			function onMouseLeave() {
				for (const indicator of indicators.values()) {
					indicator.style.display = 'none'
				}
			}
			node.addEventListener('mousemove', trackMousePosition)
			node.addEventListener('scroll', updateIndicators)
			node.addEventListener('mouseleave', onMouseLeave)
			return {
				destroy() {
					node.removeEventListener('mousemove', trackMousePosition)
					node.removeEventListener('mouseleave', onMouseLeave)
				},
			}
		},
		element(node: HTMLElement) {
			indicators.add(node)
			node.style.position = 'absolute'
			return {
				destroy: () => indicators.delete(node),
			}
		},
	}
}
