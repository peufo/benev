import { eventPath } from '$lib/store'
import { invalidateAll } from '$app/navigation'
import { get } from 'svelte/store'
import type { Action } from 'svelte/action'
import axios from 'axios'
import type { Dayjs } from 'dayjs'
import { formatRangeHour } from '$lib/formatRange'

type Params = {
	origin: Dayjs
	msHeight: number
	headerHeight: number
	onCreate: (period: { start: Date; end: Date }) => unknown
}

export const newPeriod: Action<HTMLDivElement, Params> = (node, params) => {
	function offsetYToTime(offsetY: number): Dayjs {
		const ms = roundMs((offsetY - params.headerHeight) / params.msHeight, 15)
		return params.origin.add(ms, 'ms')
	}
	function timeToOffsetY(time: Dayjs) {
		return -params.origin.diff(time) * params.msHeight + params.headerHeight
	}

	function handleMouseDown(event: MouseEvent) {
		const target = event.target as HTMLDivElement
		const teamId = target.dataset['team']
		if (!teamId) return
		event.preventDefault()

		const originY = event.clientY
		const start = offsetYToTime(event.offsetY)
		let end = start.clone()

		const ghost = document.createElement('div')
		const h3 = document.createElement('h3')
		ghost.classList.add('absolute', 'left-0', 'right-0', 'bg-base-200', 'rounded-lg', 'border')
		h3.classList.add('text-xs', 'font-semibold', 'ml-1')
		ghost.appendChild(h3)
		const updateGhost = () => {
			const [top, bottom] = end.isAfter(start) ? [start, end] : [end, start]
			ghost.style.top = `${timeToOffsetY(top)}px`
			ghost.style.height = `${bottom.diff(top) * params.msHeight}px`
			h3.innerText = formatRangeHour({ start: top.toDate(), end: bottom.toDate() })
		}
		updateGhost()
		target.appendChild(ghost)

		const handleMouseMove = ({ clientY }: MouseEvent) => {
			const delta = roundMs((clientY - originY) / params.msHeight, 15)
			end = start.add(delta, 'ms')
			updateGhost()
		}

		const handleMouseUp = async () => {
			document.removeEventListener('mousemove', handleMouseMove)
			const [_start, _end] = end.isAfter(start) ? [start, end] : [end, start]
			const newPeriod = { start: _start.toDate(), end: _end.toDate() }
			params.onCreate(newPeriod)
			ghost.remove()
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp, { once: true })
	}

	node.addEventListener('mousedown', handleMouseDown)

	return {
		update: (newParams) => (params = newParams),
		destroy: () => {
			node.removeEventListener('mousedown', handleMouseDown)
		},
	}
}

function roundMs(ms: number, nbMinutes: number) {
	const round = 60_000 * nbMinutes
	return Math.round(ms / round) * round
}

async function createPeriod(teamId: string, period: { start: Date; end: Date }) {
	const form = new FormData()
	const $eventPath = get(eventPath)

	form.append('number_maxSubscribe', '1')
	form.append('date_start', period.start.toUTCString())
	form.append('date_end', period.end.toUTCString())
	await axios.postForm(`${$eventPath}/teams/${teamId}?/new_period`, form)
	await invalidateAll()
}
