import type { Action } from 'svelte/action'
import type { Dayjs } from '$lib/dayjs'
import { formatRangeHour } from '$lib/formatRange'
import type { Period, Team } from '@prisma/client'
import { goto } from '$app/navigation'
import { urlParam } from 'fuma'
import { get } from 'svelte/store'
import { page } from '$app/stores'
import { time } from './utils'
import type { Plan } from './types'

type Params = {
	plan: Plan
	team: Team & { periods: Period[] }
	isEnable?: (target: HTMLDivElement) => boolean
}

const GHOST_CLASSES: Record<Plan['axis'], string[]> = {
	x: ['h-full'],
	y: ['w-full'],
}

export const createPeriod: Action<HTMLDivElement, Params> = (
	node,
	{ plan, team, isEnable = () => true }
) => {
	const ghost = document.createElement('div')
	const title = document.createElement('h3')
	ghost.id = 'ghost_create_period'
	ghost.classList.add(
		...GHOST_CLASSES[plan.axis],
		'bg-accent/50',
		'rounded-md',
		'border',
		'absolute',
		'top-0',
		'left-0'
	)
	title.classList.add('text-xs', 'font-semibold', 'm-1', 'whitespace-nowrap')
	ghost.appendChild(title)

	let preserveGhostOnLocationChange = false
	const pageUnsubscribe = page.subscribe(() => {
		if (preserveGhostOnLocationChange) return
		if (ghost.parentElement === node) node.removeChild(ghost)
	})

	function pxToTime(px: number): Dayjs {
		const hours = px / plan.hourSize
		const magnetValue = time(hours, 'hour').roundBy(15, 'minute')
		return plan.start.add(magnetValue, 'hour')
	}
	function timeToPx(time: Dayjs): number {
		return (time.diff(plan.start, 'ms') * plan.hourSize) / 3_600_000
	}

	function handleMouseDown(event: MouseEvent) {
		const target = event.target as HTMLDivElement
		if (target !== node && !isEnable(target)) return
		event.preventDefault()
		node.classList.add('drag-button-hidden')
		const mouseOrigin = { x: event.clientX, y: event.clientY }
		const start = pxToTime(plan.axis === 'x' ? event.offsetX : event.offsetY)
		let end = start.clone()
		const updateGhost = {
			x() {
				const [left, right] = end.isAfter(start) ? [start, end] : [end, start]
				ghost.style.translate = `${timeToPx(left)}px`
				ghost.style.width = `${right.diff(left) * (plan.hourSize / 3_600_000)}px`
				title.innerText = formatRangeHour({ start: left.toDate(), end: right.toDate() })
			},
			y() {
				const [top, bottom] = end.isAfter(start) ? [start, end] : [end, start]
				ghost.style.top = `${timeToPx(top)}px`
				ghost.style.height = `${bottom.diff(top) * (plan.hourSize / 3_600_000)}px`
				title.innerText = formatRangeHour({ start: top.toDate(), end: bottom.toDate() })
			},
		}
		updateGhost[plan.axis]()
		node.appendChild(ghost)

		const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
			const deltaPx = plan.axis === 'x' ? clientX - mouseOrigin.x : clientY - mouseOrigin.y
			const deltaHour = deltaPx / plan.hourSize
			const detlaMagnet = time(deltaHour, 'hour').roundBy(15, 'minute')
			end = start.add(detlaMagnet, 'hour')
			updateGhost[plan.axis]()
		}

		const handleMouseUp = async () => {
			document.removeEventListener('mousemove', handleMouseMove)
			node.classList.remove('drag-button-hidden')
			const [_start, _end] = end.isAfter(start) ? [start, end] : [end, start]
			const { periods, ...teamWithoutPeriods } = team
			const newPeriod: Partial<Period & { team: Team }> = {
				team: teamWithoutPeriods,
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
			plan = newParams.plan
			team = newParams.team
			if (newParams.isEnable && newParams.isEnable !== isEnable) isEnable = newParams.isEnable
		},
		destroy: () => {
			pageUnsubscribe()
			node.removeEventListener('mousedown', handleMouseDown)
		},
	}
}
