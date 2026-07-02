export function useGrabScale(axis: 'x' | 'y') {
	let container: HTMLDivElement | null = null

	return {
		container(node: HTMLDivElement) {
			container = node
			return {
				destroy() {
					container = null
				},
			}
		},
		scale(node: HTMLDivElement) {
			let originScroll = 0
			let originMouse = 0

			function onMouseDown(event: MouseEvent) {
				if (!container) throw new Error('container is not initialized')
				event.preventDefault()
				originMouse = event[axis]
				originScroll = axis === 'x' ? container.scrollLeft : container.scrollTop
				node.classList.add('cursor-grabbing')
				document.addEventListener('mousemove', onMouseMove)
				document.addEventListener('mouseup', onMouseUp, { once: true })
			}

			function onMouseMove(event: MouseEvent) {
				if (!container) throw new Error('container is not initialized')
				event.preventDefault()
				const deltaMouse = event[axis] - originMouse
				container.scrollTo({ [axis === 'x' ? 'left' : 'top']: originScroll - deltaMouse })
			}

			function onMouseUp() {
				node.classList.remove('cursor-grabbing')
				document.removeEventListener('mousemove', onMouseMove)
			}

			node.addEventListener('mousedown', onMouseDown)

			return {
				destroy() {
					node.removeEventListener('click', onMouseDown)
					document.removeEventListener('mousemove', onMouseMove)
					document.removeEventListener('mouseup', onMouseUp)
				},
			}
		},
	}
}
