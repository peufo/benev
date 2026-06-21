const INDICATOR_WIDTH = 3
const INDICATOR_LENGHT = 26

export function usePositionIndicator(orientation: 'x' | 'y') {
	let indicator: HTMLDivElement | null = null

	return {
		container(node: HTMLDivElement) {
			const mousePosition = { x: 0, y: 0 }

			function trackMousePosition(event: MouseEvent) {
				const clientRect = node.getClientRects().item(0) || { x: 0, y: 0 }
				mousePosition.x = event.x - clientRect.x
				mousePosition.y = event.y - clientRect.y
				updateIndicator()
			}

			function updateIndicator() {
				if (!indicator) return
				indicator.style.display = 'block'
				if (orientation === 'x') {
					const positionX = node.scrollLeft + mousePosition.x
					indicator.style.translate = `${positionX}px 0px`
				} else {
					const positionY = node.scrollTop + mousePosition.y
					indicator.style.translate = `0px ${positionY}px`
				}
			}

			function onMouseLeave() {
				if (indicator) indicator.style.display = 'none'
			}
			node.addEventListener('mousemove', trackMousePosition)
			node.addEventListener('scroll', updateIndicator)
			node.addEventListener('mouseleave', onMouseLeave)
			return {
				destroy() {
					node.removeEventListener('mousemove', trackMousePosition)
					node.removeEventListener('mouseleave', onMouseLeave)
				},
			}
		},
		scale(node: HTMLDivElement) {
			indicator = document.createElement('div')
			indicator.style.position = 'absolute'
			indicator.classList.add('bg-accent', 'rounded')
			if (orientation === 'x') {
				indicator.style.width = `${INDICATOR_WIDTH}px`
				indicator.style.height = `${INDICATOR_LENGHT}px`
				indicator.style.left = `-${INDICATOR_WIDTH * 0.66}px`
				indicator.style.bottom = '0px'
			} else {
				indicator.style.width = `${INDICATOR_LENGHT}px`
				indicator.style.height = `${INDICATOR_WIDTH}px`
				indicator.style.top = `-${INDICATOR_WIDTH}px`
				indicator.style.right = '0px'
			}
			node.appendChild(indicator)
			return {
				destroy() {
					if (indicator) node.removeChild(indicator)
				},
			}
		},
	}
}
