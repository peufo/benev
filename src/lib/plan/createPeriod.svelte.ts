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

// La taille minimale garde le trait d'accroche visible au tout début du glissé, quand la période
// tracée ne dure encore rien.
const GHOST_CLASSES: Record<Plan['axis'], string[]> = {
	x: ['h-[calc(100%-8px)]', 'my-1', 'min-w-0.5'],
	y: ['w-full', 'mx-1', 'min-h-0.5'],
}

/**
 * Le ghost sert deux gestes avec un seul élément: au survol, un trait d'accroche qui annonce
 * l'heure de départ; pendant le glissé, le bloc de la période en cours de tracé. Le trait grandit
 * donc en bloc depuis l'heure exacte qu'il annonçait.
 */
const GHOST_MODE_CLASSES = {
	hover: ['bg-accent', 'rounded'],
	drag: ['bg-accent/50', 'rounded-md', 'border', 'border-hard'],
}

/** Épaisseur du trait d'accroche, sur l'axe du temps. */
const MARK_SIZE = '2px'

export const createPeriod: Action<HTMLDivElement, Params> = (
	node,
	{ plan, team, isEnable = () => true }
) => {
	const ghost = document.createElement('div')
	const title = document.createElement('h3')
	ghost.id = 'ghost_create_period'
	ghost.classList.add(
		...GHOST_CLASSES[plan.axis],
		'absolute',
		'top-0',
		'left-0',
		// Sous le curseur, le ghost deviendrait la cible des `mousemove`: `isEnable` le refuserait
		// et il clignoterait.
		'pointer-events-none',
		// Le trait traverse toute la ligne (resp. la colonne) et croise les cartes en `z-10`.
		'z-20',
		'hide-on-zoom'
	)
	// Positionné, le titre ne peut plus élargir le trait de 2px; en mode bloc, seul enfant du
	// ghost, il se rend exactement au même endroit qu'en flux.
	title.classList.add('text-xs', 'font-semibold', 'm-1', 'whitespace-nowrap', 'absolute', 'top-0')
	ghost.appendChild(title)

	function setGhostMode(mode: keyof typeof GHOST_MODE_CLASSES) {
		ghost.classList.remove(...GHOST_MODE_CLASSES[mode === 'hover' ? 'drag' : 'hover'])
		ghost.classList.add(...GHOST_MODE_CLASSES[mode])
	}
	function detachGhost() {
		if (ghost.parentElement === node) node.removeChild(ghost)
	}

	/** Dernière position connue du curseur, en coordonnées client; `null` hors du nœud. */
	let pointer: { x: number; y: number } | null = null
	let isDragging = false
	/** Le ghost appartient au formulaire de création tant que son tiroir est ouvert. */
	let isPendingCreation = false
	let preserveGhostOnLocationChange = false
	// `page` de `$app/state` n'est plus un store: l'action tourne déjà dans un effet, l'effet
	// enfant créé ici est donc détruit avec le nœud, sans désabonnement à tenir.
	$effect(() => {
		void page.url // seule dépendance: n'importe quelle navigation
		if (preserveGhostOnLocationChange) return
		isPendingCreation = false
		detachGhost()
		// Une navigation efface le bloc de création, pas l'invitation: le zoom écrit son échelle
		// dans l'URL, et le trait doit rester sous un curseur toujours posé sur la ligne.
		showHoverGhost()
	})

	function pxToTime(px: number): Dayjs {
		const hours = px / plan.hourSize
		const magnetValue = time(hours, 'hour').roundBy(15, 'minute')
		return plan.start.add(magnetValue, 'hour')
	}
	function timeToPx(time: Dayjs): number {
		return (time.diff(plan.start, 'ms') * plan.hourSize) / 3_600_000
	}
	/**
	 * Les coordonnées client se relisent sans évènement: le trait peut donc se replacer après un
	 * zoom ou un défilement, souris immobile.
	 */
	function pointerTime(x: number, y: number): Dayjs {
		const rect = node.getBoundingClientRect()
		return pxToTime(plan.axis === 'x' ? x - rect.left : y - rect.top)
	}

	function showHoverGhost() {
		if (!pointer || isDragging || isPendingCreation) return
		const start = pointerTime(pointer.x, pointer.y)
		setGhostMode('hover')
		if (plan.axis === 'x') {
			ghost.style.translate = `${timeToPx(start)}px`
			ghost.style.width = MARK_SIZE
		} else {
			ghost.style.top = `${timeToPx(start)}px`
			ghost.style.height = MARK_SIZE
		}
		// Bornes égales: `formatRangeHour` rend la seule heure de départ.
		title.innerText = formatRangeHour({ start: start.toDate(), end: start.toDate() })
		node.appendChild(ghost)
	}

	function handleHoverMove(event: MouseEvent) {
		const target = event.target as HTMLDivElement
		// Le trait n'annonce le geste que là où il crée: pas sur une période ni sur ses poignées.
		if (target !== node && !isEnable(target)) return handleHoverLeave()
		pointer = { x: event.clientX, y: event.clientY }
		showHoverGhost()
	}

	function handleHoverLeave() {
		pointer = null
		if (!isDragging && !isPendingCreation) detachGhost()
	}

	/** Zoom et défilement changent l'heure sous un curseur immobile. */
	function handleScroll() {
		showHoverGhost()
	}

	function handleMouseDown(event: MouseEvent) {
		const target = event.target as HTMLDivElement
		if (target !== node && !isEnable(target)) return
		event.preventDefault()
		isDragging = true
		setGhostMode('drag')
		node.classList.add('drag-button-hidden')
		const mouseOrigin = { x: event.clientX, y: event.clientY }
		const start = pointerTime(event.clientX, event.clientY)
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
			isDragging = false
			const [_start, _end] = end.isAfter(start) ? [start, end] : [end, start]

			// Un simple clic (ou un glissé trop court pour l'aimant) ne définit aucune durée: on invite
			// au cliqué-glissé au lieu d'ouvrir un formulaire que la validation refuserait.
			if (_end.diff(_start) < PERIOD_MIN_MS) {
				detachGhost()
				toast.info(
					`Cliquez-glissez pour définir la durée de la période (${PERIOD_MIN_MINUTES} minutes minimum)`
				)
				// L'invitation reste sous les yeux: le trait d'accroche reprend sa place.
				showHoverGhost()
				return
			}

			const { periods, ...teamWithoutPeriods } = team
			const newPeriod: Partial<Period & { team: Team }> = {
				team: teamWithoutPeriods,
				start: _start.toDate(),
				end: _end.toDate(),
			}
			const urlCreatePeriod = urlParam.with({ form_period: JSON.stringify(newPeriod) })
			// Le bloc appartient au formulaire jusqu'à sa fermeture: un mouvement de souris ne doit
			// pas le ramener à un trait d'accroche.
			isPendingCreation = true
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
	node.addEventListener('mousemove', handleHoverMove)
	node.addEventListener('mouseleave', handleHoverLeave)
	// Les évènements de défilement ne remontent pas: seule la phase de capture les voit d'ici.
	document.addEventListener('scroll', handleScroll, { capture: true, passive: true })

	return {
		update: (newParams) => {
			plan = newParams.plan
			team = newParams.team
			if (newParams.isEnable && newParams.isEnable !== isEnable) isEnable = newParams.isEnable
			// Le zoom réassigne le plan: sans ça le trait pointerait une autre heure que le curseur
			// jusqu'au prochain mouvement de souris.
			showHoverGhost()
		},
		destroy: () => {
			node.removeEventListener('mousedown', handleMouseDown)
			node.removeEventListener('mousemove', handleHoverMove)
			node.removeEventListener('mouseleave', handleHoverLeave)
			document.removeEventListener('scroll', handleScroll, { capture: true })
		},
	}
}
