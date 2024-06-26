import type { Action } from 'svelte/action'
import type { Dayjs } from 'dayjs'
import { formatRangeHour } from '$lib/formatRange'
import type { Period, Team } from '@prisma/client'
import { goto } from '$app/navigation'
import { urlParam } from 'fuma'
import { get } from 'svelte/store'
import { page } from '$app/stores'

type Params = {
	origin: Dayjs
	msSize: number
	team: Team
}

export const createPeriod: Action<HTMLDivElement, Params> = (node, params) => {
	let ghost: HTMLDivElement | null = null
	let preserveGhostOnLocationChange = false
	const pageUnsubscribe = page.subscribe(() => {
		if (preserveGhostOnLocationChange) return
		ghost?.remove()
	})

	function offsetYToTime(offsetY: number): Dayjs {
		const ms = roundMs(offsetY / params.msSize, 15)
		return params.origin.add(ms, 'ms')
	}
	function timeToOffsetY(time: Dayjs) {
		return -params.origin.diff(time) * params.msSize
	}

	function handleMouseDown(event: MouseEvent) {
		const target = event.target as HTMLDivElement
		event.preventDefault()

		const originY = event.clientY
		const start = offsetYToTime(event.offsetY)
		let end = start.clone()

		ghost?.remove()
		ghost = document.createElement('div')
		const h3 = document.createElement('h3')
		ghost.classList.add('absolute', 'left-0', 'right-0', 'bg-primary/30', 'rounded-lg', 'border')
		h3.classList.add('text-xs', 'font-semibold', 'ml-1')
		ghost.appendChild(h3)
		const updateGhost = () => {
			if (!ghost) return
			const [top, bottom] = end.isAfter(start) ? [start, end] : [end, start]
			ghost.style.top = `${timeToOffsetY(top)}px`
			ghost.style.height = `${bottom.diff(top) * params.msSize}px`
			h3.innerText = formatRangeHour({ start: top.toDate(), end: bottom.toDate() })
		}
		updateGhost()
		target.appendChild(ghost)

		const handleMouseMove = ({ clientY }: MouseEvent) => {
			const delta = roundMs((clientY - originY) / params.msSize, 15)
			end = start.add(delta, 'ms')
			updateGhost()
		}

		const handleMouseUp = async (_event: MouseEvent) => {
			document.removeEventListener('mousemove', handleMouseMove)
			const [_start, _end] = end.isAfter(start) ? [start, end] : [end, start]
			const newPeriod: Partial<Period & { team: Team }> = {
				team: params.team,
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
		update: (newParams) => (params = newParams),
		destroy: () => {
			pageUnsubscribe()
			node.removeEventListener('mousedown', handleMouseDown)
		},
	}
}

function roundMs(ms: number, nbMinutes: number) {
	const round = 60_000 * nbMinutes
	return Math.round(ms / round) * round
}
