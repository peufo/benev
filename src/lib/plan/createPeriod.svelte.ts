import type { Action } from 'svelte/action'
import { tick } from 'svelte'
import { toast } from 'svelte-sonner'
import type { Dayjs } from '$lib/dayjs'
import { formatRangeHour } from '$lib/formatRange'
import type { Period, Team } from '@prisma/client'
import { goto } from '$app/navigation'
import { urlParam } from 'fuma'
import { page } from '$app/state'
import { PERIOD_MIN_MINUTES, PERIOD_MIN_MS } from '$lib/constant'
import { time } from './utils'
import type { Plan } from './types'

type Params = {
	plan: Plan
	team: Team & { periods: Period[] }
	isEnable?: (target: HTMLDivElement) => boolean
}

const GHOST_CLASSES: Record<Plan['axis'], string[]> = {
	x: ['h-[calc(100%-8px)]', 'my-1'],
	y: ['w-full', 'mx-1'],
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
		'border-hard',
		'absolute',
		'top-0',
		'left-0'
	)
	title.classList.add('text-xs', 'font-semibold', 'm-1', 'whitespace-nowrap')
	ghost.appendChild(title)

	let preserveGhostOnLocationChange = false
	// `page` de `$app/state` n'est plus un store: l'action tourne déjà dans un effet, l'effet
	// enfant créé ici est donc détruit avec le nœud, sans désabonnement à tenir.
	$effect(() => {
		void page.url // seule dépendance: n'importe quelle navigation
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

			// Un simple clic (ou un glissé trop court pour l'aimant) ne définit aucune durée: on invite
			// au cliqué-glissé au lieu d'ouvrir un formulaire que la validation refuserait.
			if (_end.diff(_start) < PERIOD_MIN_MS) {
				if (ghost.parentElement === node) node.removeChild(ghost)
				toast.info(
					`Cliquez-glissez pour définir la durée de la période (${PERIOD_MIN_MINUTES} minutes minimum)`
				)
				return
			}

			const { periods, ...teamWithoutPeriods } = team
			const newPeriod: Partial<Period & { team: Team }> = {
				team: teamWithoutPeriods,
				start: _start.toDate(),
				end: _end.toDate(),
			}
			const urlCreatePeriod = urlParam.with({ form_period: JSON.stringify(newPeriod) })
			preserveGhostOnLocationChange = true
			await goto(urlCreatePeriod)
			// L'effet ne lit la nouvelle URL qu'au prochain flush: baisser le drapeau avant de
			// l'attendre reviendrait à ne jamais le lever.
			await tick()
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
			node.removeEventListener('mousedown', handleMouseDown)
		},
	}
}
