import { goto } from '$app/navigation'
import { debounce } from '$lib/debounce'
import type { Dayjs } from 'dayjs'
import { urlParam } from 'fuma'
import { get } from 'svelte/store'

type NavigateOnScrollOptions = {
	axis: 'x' | 'y'
	cursor: Dayjs
}

const MARGIN = 10

export function navigateOnScroll(node: HTMLElement, { axis, cursor }: NavigateOnScrollOptions) {
	const isStart = axis === 'x' ? () => node.scrollLeft <= MARGIN : () => node.scrollTop <= MARGIN
	const isEnd =
		axis === 'x'
			? () => node.scrollLeft + node.clientWidth + MARGIN >= node.scrollWidth
			: () => node.scrollTop + node.clientHeight + MARGIN >= node.scrollHeight

	const onScroll = debounce(() => {
		if (isStart()) goto(get(urlParam).with({ cursor: cursor.add(-4, 'day').toJSON() }))
		else if (isEnd()) goto(get(urlParam).with({ cursor: cursor.add(4, 'day').toJSON() }))
	}, 200)

	node.addEventListener('scroll', onScroll)
	return {
		update(options: NavigateOnScrollOptions) {
			axis = options.axis
			cursor = options.cursor
		},
		destroy() {
			node.removeEventListener('scroll', onScroll)
		},
	}
}
