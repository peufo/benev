import type { Dayjs } from 'dayjs'
import type { Plan } from './types'

export type View = {
	start: Dayjs
	end: Dayjs
}
type TrackViewParam = {
	plan: Plan
	padding: number
	onChange: (view: View) => void
}

export function trackView(node: HTMLDivElement, { plan, padding, onChange }: TrackViewParam) {
	function computeView() {
		const offset = plan.axis === 'x' ? node.scrollLeft : node.scrollTop
		const len = (plan.axis === 'x' ? node.clientWidth : node.clientHeight) - padding
		const start = plan.start.add(offset / plan.hourSize, 'hours')
		const end = start.add(len / plan.hourSize, 'hours')
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
			plan = params.plan
			computeView()
		},
	}
}
