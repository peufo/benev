import type { Action } from 'svelte/action'
import type { Dayjs } from 'dayjs'
import { formatRangeHour } from '$lib/formatRange'
import type { Period, Team } from '@prisma/client'
import { goto } from '$app/navigation'
import { createEventEmitter, jsonParse, urlParam } from 'fuma'
import { get } from 'svelte/store'

type Params = {
	origin: Dayjs
	msSize: number
	headerHeight: number
}

export const newPeriodGhost = createEventEmitter<{ remove: void }>()

export const newPeriod: Action<HTMLDivElement, Params> = (node, params) => {
	function offsetYToTime(offsetY: number): Dayjs {
		const ms = roundMs((offsetY - params.headerHeight) / params.msSize, 15)
		return params.origin.add(ms, 'ms')
	}
	function timeToOffsetY(time: Dayjs) {
		return -params.origin.diff(time) * params.msSize + params.headerHeight
	}

	function handleMouseDown(event: MouseEvent) {
		const target = event.target as HTMLDivElement
		const team = jsonParse<Team | undefined>(target.dataset['team'], undefined)
		if (!team) return
		event.preventDefault()
		newPeriodGhost.emit('remove')

		const originY = event.clientY
		const start = offsetYToTime(event.offsetY)
		let end = start.clone()

		const ghost = document.createElement('div')
		const h3 = document.createElement('h3')
		ghost.classList.add('absolute', 'left-0', 'right-0', 'bg-primary/30', 'rounded-lg', 'border')
		h3.classList.add('text-xs', 'font-semibold', 'ml-1')
		ghost.appendChild(h3)
		const updateGhost = () => {
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
				team,
				start: _start.toDate(),
				end: _end.toDate(),
			}
			await goto(get(urlParam).with({ form_period: JSON.stringify(newPeriod) }))
			newPeriodGhost.on('remove', () => ghost.remove())
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
