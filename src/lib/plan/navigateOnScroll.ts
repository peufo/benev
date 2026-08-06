import { goto } from '$app/navigation'
import { debounce } from '$lib/debounce'
import { urlParam } from 'fuma'
import { RANGE_DAYS } from './constants'
import { page } from '$app/state'
import type { Plan } from './types'
import { consumeZoomScroll } from './zoom'

const MARGIN = 10

export function isScrollStart(node: HTMLElement, axis: 'x' | 'y') {
	return axis === 'x' ? node.scrollLeft <= MARGIN : node.scrollTop <= MARGIN
}

export function isScrollEnd(node: HTMLElement, axis: 'x' | 'y') {
	return axis === 'x'
		? node.scrollLeft + node.clientWidth + MARGIN >= node.scrollWidth
		: node.scrollTop + node.clientHeight + MARGIN >= node.scrollHeight
}

export function navigateOnScroll(node: HTMLElement, { axis, cursor }: Plan) {
	const isStart = () => isScrollStart(node, axis)
	const isEnd = () => isScrollEnd(node, axis)

	const navigate = debounce(() => {
		if (page.url.searchParams.get('form_period')) return
		if (isStart()) goto(urlParam.with({ cursor: cursor.add(-RANGE_DAYS, 'day').toJSON() }))
		else if (isEnd()) goto(urlParam.with({ cursor: cursor.add(RANGE_DAYS, 'day').toJSON() }))
	}, 200)

	function onScroll() {
		// Le zoom vient de recentrer la vue: toucher un bord n'est alors pas une demande de
		// plage suivante.
		if (consumeZoomScroll()) return
		navigate()
	}

	node.addEventListener('scroll', onScroll)
	return {
		update(options: Plan) {
			axis = options.axis
			cursor = options.cursor
		},
		destroy() {
			node.removeEventListener('scroll', onScroll)
		},
	}
}
