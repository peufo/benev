import type { Dayjs } from 'dayjs'

export type View = {
	start: Dayjs
	end: Dayjs
}
type TrackViewParam = {
	axis: 'x' | 'y'
	hourSize: number
	origin: Dayjs
	padding: number
	onChange: (view: View) => void
}

export function trackView(
	node: HTMLDivElement,
	{ axis, hourSize, origin, padding, onChange }: TrackViewParam
) {
	function computeView() {
		const offset = axis === 'x' ? node.scrollLeft : node.scrollTop
		const len = (axis === 'x' ? node.clientWidth : node.clientHeight) - padding
		const start = origin.add(offset / hourSize, 'hours')
		const end = start.add(len / hourSize, 'hours')
		onChange({ start, end })
	}

	window.addEventListener('resize', computeView)
	node.addEventListener('scroll', computeView)
	return {
		destroy() {
			window.removeEventListener('resize', computeView)
			node.removeEventListener('scroll', computeView)
		},
		update(params: TrackViewParam) {
			if (params.hourSize !== hourSize) hourSize = params.hourSize
			if (params.origin !== origin) origin = params.origin
			computeView()
		},
	}
}
