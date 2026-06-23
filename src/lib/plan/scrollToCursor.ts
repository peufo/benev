import type { Dayjs } from 'dayjs'

type ScrollToCursor = {
	axis: 'x' | 'y'
	cursor: Dayjs
}

export function scrollToCursor(node: HTMLElement, { axis, cursor }: ScrollToCursor) {
	let current = cursor
	scroll()

	function scroll(behavior: ScrollBehavior = 'instant') {
		const left = (node.scrollWidth - node.clientWidth) / 2 + 50
		const top = (node.scrollHeight - node.clientHeight) / 2
		if (axis === 'x') node.scroll({ left, behavior })
		else node.scroll({ top, behavior })
	}

	return {
		update(options: ScrollToCursor) {
			if (!current.isSame(options.cursor)) {
				current = options.cursor
				scroll('smooth')
			}
		},
	}
}
