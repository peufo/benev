<script lang="ts">
	import { toast } from 'svelte-sonner'
	import { isHttpError } from '@sveltejs/kit'
	import type { Component } from 'svelte'
	import type { TeamState } from '@prisma/client'
	import type { IconProps } from '@lucide/svelte'
	import type { ClassValue } from 'svelte/elements'
	import { urlParam } from 'fuma'
	import type { PeriodWithMembers, Plan } from './types'
	import { PeriodCardContent } from './cardContent'
	import { time } from './utils'
	import { clipToPlan } from './clipToPlan'
	import { movePeriod } from '$lib/period/period.remote'
	import { engagedSubscribes, scheduleChanged } from '$lib/period/periodChange'
	import { selectNotify } from '$lib/period/selectNotify'
	import { magnet } from './magnet.svelte'
	import DragButton from './DragButton.svelte'

	interface Props {
		period: PeriodWithMembers
		/** Hors brouillon, déplacer un créneau inscrit peut prévenir ses inscrit·es: on demande avant. */
		teamState: TeamState
		plan: Plan
		drags: {
			icon?: Component<IconProps>
			class?: ClassValue
			moveStart?: boolean
			moveEnd?: boolean
		}[]
		/** Remplacent les évènements de la version Svelte 4. */
		onupdate?: (value: PeriodWithMembers) => void
	}

	let { period, teamState, plan, drags, onupdate }: Props = $props()

	let deltaStartMs = $state(0)
	let deltaEndMs = $state(0)

	let msSize = $derived(time(plan.hourSize).to('hour'))
	let shown = $derived(
		clipToPlan(
			{
				start: period.start.getTime() + magnet(deltaStartMs),
				end: period.end.getTime() + magnet(deltaEndMs),
			},
			plan
		)
	)
	let startPx = $derived(msSize * (shown.start - plan.start.valueOf()))
	let sizePx = $derived(msSize * (shown.end - shown.start))

	// Tirer un bord coupé déplacerait une date hors de vue. La coupe se lit sur les dates au repos:
	// lue pendant le geste, elle démonterait la poignée qu'on tient.
	let cut = $derived(clipToPlan({ start: +period.start, end: +period.end }, plan))
	let visibleDrags = $derived(
		drags.filter(
			({ moveStart, moveEnd }) =>
				!(moveStart && !moveEnd && cut.clippedStart) && !(moveEnd && !moveStart && cut.clippedEnd)
		)
	)

	async function handleGrabDone() {
		// Un simple clic sur une poignée ne déplace rien: inutile d'appeler le serveur.
		if (!magnet(deltaStartMs) && !magnet(deltaEndMs)) return

		const start = new Date(period.start.getTime() + magnet(deltaStartMs))
		const end = new Date(period.end.getTime() + magnet(deltaEndMs))
		// Les deltas restent le temps du dialogue: la carte est vue là où elle atterrira.
		const notify = await chooseNotify({ start, end })
		if (notify === undefined) {
			deltaStartMs = 0
			deltaEndMs = 0
			return
		}
		try {
			const moved = await movePeriod({ id: period.id, start, end, notify })
			// Les dates viennent du serveur, et les deltas ne retombent à zéro qu'une fois la carte
			// repositionnée dessus: dans l'autre ordre elle reviendrait un instant à sa place d'origine.
			onupdate?.({ ...period, start: moved.start, end: moved.end })
			toast.success('Créneau mis à jour')
		} catch (err) {
			// `HttpError` n'étend pas `Error`: son message se lit dans `body`.
			toast.error(isHttpError(err) ? err.body.message : 'Erreur')
			console.error(err)
		}
		deltaStartMs = 0
		deltaEndMs = 0
	}

	/** `true` sans question quand personne n'a rien reçu; `undefined` quand on renonce au geste. */
	async function chooseNotify(after: { start: Date; end: Date }): Promise<boolean | undefined> {
		if (teamState === 'draft') return true
		const n = engagedSubscribes(period.subscribes).length
		if (!n || !scheduleChanged(period, after)) return true
		return selectNotify(n)
	}
</script>

<div class={plan.axis === 'x' ? 'w-0' : 'h-0'}>
	<div
		id={period.id}
		class:h-full={plan.axis === 'x'}
		class:w-full={plan.axis === 'y'}
		style={plan.axis === 'x'
			? `left: ${startPx}px; width: ${sizePx}px`
			: `top: ${startPx}px; height: ${sizePx}px`}
		class={[
			'group relative z-10 hover:z-20',
			'rounded-md p-1 text-sm border border-hard',
			'overflow-visible min-h-8',
			// Le côté coupé par le bord de la plage reste ouvert: le créneau continue au-delà.
			shown.clippedStart &&
				(plan.axis === 'x' ? 'rounded-l-none border-l-0' : 'rounded-t-none border-t-0'),
			shown.clippedEnd &&
				(plan.axis === 'x' ? 'rounded-r-none border-r-0' : 'rounded-b-none border-b-0'),
			urlParam.has('form_period', period.id) ? 'bg-accent/60 z-20' : 'bg-accent/30',
		]}
	>
		{#each visibleDrags as drag, i (i)}
			<DragButton
				class={drag.class}
				icon={drag.icon}
				ondone={handleGrabDone}
				onmove={(delta) => {
					if (drag.moveStart) deltaStartMs = delta[plan.axis] / msSize
					if (drag.moveEnd) deltaEndMs = delta[plan.axis] / msSize
				}}
			/>
		{/each}

		<PeriodCardContent {period} {deltaStartMs} {deltaEndMs} />
	</div>
</div>
