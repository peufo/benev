import { goto } from '$app/navigation'
import { debounce } from '$lib/debounce'
import { urlParam } from 'fuma'
import { get } from 'svelte/store'
import { RANGE_DAYS } from './constants'
import { page } from '$app/state'
import type { Plan } from './types'

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

	const onScroll = debounce(() => {
		if (page.url.searchParams.get('form_period')) return
		if (isStart()) goto(get(urlParam).with({ cursor: cursor.add(-RANGE_DAYS, 'day').toJSON() }))
		else if (isEnd()) goto(get(urlParam).with({ cursor: cursor.add(RANGE_DAYS, 'day').toJSON() }))
	}, 200)

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
