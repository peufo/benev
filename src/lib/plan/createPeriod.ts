import type { Action } from 'svelte/action'
import type { Dayjs } from 'dayjs'
import { formatRangeHour } from '$lib/formatRange'
import type { Period, Team } from '@prisma/client'
import { goto } from '$app/navigation'
import { urlParam } from 'fuma'
import { get } from 'svelte/store'
import { page } from '$app/stores'
import { time } from './utils'

type Params = {
	axis: Axis
	origin: Dayjs
	hourSize: number
	team: Team
	isEnable?: (target: HTMLDivElement) => boolean
}

type Axis = 'x' | 'y'

const GHOST_CLASSES: Record<Axis, string[]> = {
	x: [],
	y: ['absolute', 'left-0', 'right-0'],
}

export const createPeriod: Action<HTMLDivElement, Params> = (
	node,
	{ origin, hourSize, team, axis, isEnable = () => true }
) => {
	let ghost: HTMLDivElement | null = null
	let preserveGhostOnLocationChange = false
	const pageUnsubscribe = page.subscribe(() => {
		if (preserveGhostOnLocationChange) return
		ghost?.remove()
	})

	function offsetToTime(offset: number): Dayjs {
		const hours = time(offset / hourSize, 'hour').roundBy(15, 'minute').value
		return origin.add(hours, 'hour')
	}
	function timeToOffset(time: Dayjs) {
		return time.diff(origin, 'hour') * hourSize
	}

	function handleMouseDown(event: MouseEvent) {
		const target = event.target as HTMLDivElement
		if (!isEnable(target)) return
		event.preventDefault()

		const mouseOrigin = { x: event.clientX, y: event.clientY }
		const start = offsetToTime(axis === 'x' ? event.offsetX : event.offsetY)
		let end = start.clone()

		ghost?.remove()
		ghost = document.createElement('div')
		ghost.classList.add(...GHOST_CLASSES[axis], 'bg-primary/30', 'rounded-lg', 'border')
		const h3 = document.createElement('h3')
		h3.classList.add('text-xs', 'font-semibold', 'ml-1')
		ghost.appendChild(h3)

		const updateGhost = {
			x() {
				if (!ghost) return
				const [left, right] = end.isAfter(start) ? [start, end] : [end, start]
				ghost.style.translate = `${timeToOffset(left)}px`
				ghost.style.width = `${right.diff(left) * hourSize}px`
				h3.innerText = formatRangeHour({ start: left.toDate(), end: right.toDate() })
			},
			y() {
				if (!ghost) return
				const [top, bottom] = end.isAfter(start) ? [start, end] : [end, start]
				ghost.style.top = `${timeToOffset(top)}px`
				ghost.style.height = `${bottom.diff(top) * hourSize}px`
				h3.innerText = formatRangeHour({ start: top.toDate(), end: bottom.toDate() })
			},
		}
		updateGhost[axis]()
		target.appendChild(ghost)

		const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
			const deltaPX = axis === 'x' ? clientX - mouseOrigin.x : clientY - mouseOrigin.y
			const delta = time(deltaPX / hourSize, 'hour').roundBy(15, 'minute').value
			end = start.add(delta, 'ms')
			updateGhost[axis]()
		}

		const handleMouseUp = async (_event: MouseEvent) => {
			document.removeEventListener('mousemove', handleMouseMove)
			const [_start, _end] = end.isAfter(start) ? [start, end] : [end, start]
			const newPeriod: Partial<Period & { team: Team }> = {
				team: team,
				start: _start.toDate(),
				end: _end.toDate(),
			}
			const urlCreatePeriod = get(urlParam).with({ form_period: JSON.stringify(newPeriod) })
			preserveGhostOnLocationChange = true
			await goto(urlCreatePeriod)
			preserveGhostOnLocationChange = false
		}
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp, { once: true })
	}

	node.addEventListener('mousedown', handleMouseDown)

	return {
		update: (newParams) => {
			;({ origin, hourSize: hourSize, team, axis } = newParams)
			if (newParams.isEnable && newParams.isEnable !== isEnable) isEnable = newParams.isEnable
		},
		destroy: () => {
			pageUnsubscribe()
			node.removeEventListener('mousedown', handleMouseDown)
		},
	}
}
