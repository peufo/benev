export function usePositionIndicator(axis: 'x' | 'y') {
	const indicators = new Set<HTMLElement>()

	return {
		container(node: HTMLDivElement) {
			const mousePosition = { x: 0, y: 0 }

			function trackMousePosition(event: MouseEvent) {
				const clientRect = node.getClientRects().item(0) || { x: 0, y: 0 }
				mousePosition.x = event.x - clientRect.x
				mousePosition.y = event.y - clientRect.y
				// Seul le curseur allume les indicateurs: un défilement survenu après un
				// `mouseleave` les rallumerait à une position périmée.
				for (const indicator of indicators.values()) indicator.style.display = 'block'
				updateIndicators()
			}

			function updateIndicators() {
				for (const indicator of indicators.values()) {
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
					node.removeEventListener('scroll', updateIndicators)
					node.removeEventListener('mouseleave', onMouseLeave)
				},
			}
		},
		element(node: HTMLElement) {
			indicators.add(node)
			node.style.position = 'absolute'
			node.classList.add('hide-on-zoom')
			// Rien à indiquer tant que le curseur n'est pas entré: sans ça l'indicateur attend au
			// bord gauche (resp. haut) de l'échelle.
			node.style.display = 'none'
			return {
				destroy: () => indicators.delete(node),
			}
		},
	}
}
