<script lang="ts">
	import { toast } from 'svelte-sonner'
	import type { Component } from 'svelte'
	import type { IconProps } from '@lucide/svelte'
	import type { ClassValue } from 'svelte/elements'
	import { urlParam } from 'fuma'
	import { daytz } from '$lib/dayjs'
	import type { PeriodWithMembers, Plan } from './types'
	import { PeriodCardContent } from './cardContent'
	import { time } from './utils'
	import { movePeriod } from '$lib/period/period.remote'
	import { magnet } from './magnet.svelte'
	import DragButton from './DragButton.svelte'

	interface Props {
		period: PeriodWithMembers
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

	let { period, plan, drags, onupdate }: Props = $props()

	let deltaStartMs = $state(0)
	let deltaEndMs = $state(0)

	let msSize = $derived(time(plan.hourSize).to('hour'))
	let startPx = $derived(msSize * (-plan.start.diff(daytz(period.start)) + magnet(deltaStartMs)))
	let sizePx = $derived(
		msSize *
			(daytz(period.end).diff(daytz(period.start)) - magnet(deltaStartMs) + magnet(deltaEndMs))
	)

	async function handleGrabDone() {
		// Un simple clic sur une poignée ne déplace rien: inutile d'appeler le serveur.
		if (!magnet(deltaStartMs) && !magnet(deltaEndMs)) return

		const start = new Date(period.start.getTime() + magnet(deltaStartMs))
		const end = new Date(period.end.getTime() + magnet(deltaEndMs))
		try {
			const moved = await movePeriod({ id: period.id, teamId: period.teamId, start, end })
			// Les dates viennent du serveur, et les deltas ne retombent à zéro qu'une fois la carte
			// repositionnée dessus: dans l'autre ordre elle reviendrait un instant à sa place d'origine.
			onupdate?.({ ...period, start: moved.start, end: moved.end })
			toast.success('Période mise à jour')
		} catch (err) {
			toast.error('Erreur')
			console.error(err)
		}
		deltaStartMs = 0
		deltaEndMs = 0
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
			'rounded-md p-0 text-sm border border-hard',
			'overflow-visible min-h-7.5',
			urlParam.has('form_period', period.id) ? 'bg-accent/40 z-20' : 'bg-secondary/35',
		]}
	>
		{#each drags as drag, i (i)}
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
