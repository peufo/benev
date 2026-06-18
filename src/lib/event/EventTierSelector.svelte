<script lang="ts">
	import { Check } from 'lucide-svelte'
	import { createEventDispatcher } from 'svelte'
	import type { EventTier } from '@prisma/client'
	import { EVENT_TIER } from '$lib/constant'

	export let value = 'basic'

	const dispatch = createEventDispatcher<{ change: string }>()

	const plans: EventTier[] = ['basic', 'standard', 'premium']

	function select(plan: EventTier) {
		value = plan
		dispatch('change', plan)
	}
</script>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Choisir un plan">
	{#each plans as plan}
		{@const config = EVENT_TIER[plan]}
		{@const selected = value === plan}
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			class="card text-left border rounded-2xl p-4 transition-all duration-200 {selected
				? 'border-primary ring-1 ring-primary bg-primary/5'
				: 'border-base-200 bg-base-100 hover:border-primary/50 hover:bg-base-200/30'}"
			on:click={() => select(plan)}
		>
			<div class="flex items-start justify-between gap-3">
				<div>
					<h3 class="font-bold text-base-content">{config.label}</h3>
					<p class="text-xl font-extrabold text-primary tracking-tight">{config.price}</p>
				</div>
				<div
					class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
					class:border-primary={selected}
					class:bg-primary={selected}
					class:border-base-300={!selected}
				>
					{#if selected}
						<Check class="w-3 h-3 text-primary-content" strokeWidth={3} />
					{/if}
				</div>
			</div>
			<p class="mt-2 text-sm text-base-content/80">
				{#if config.max === null}
					Bénévoles illimités
				{:else}
					Jusqu'à {config.max} bénévoles
				{/if}
			</p>
		</button>
	{/each}
</div>

<input type="hidden" name="tier" {value} />
