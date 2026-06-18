<script lang="ts">
	import type { EventTier } from '@prisma/client'
	import { Check, Infinity } from 'lucide-svelte'
	import { EVENT_TIER } from '$lib/constant'

	export let tier: EventTier
	export let action: { label: string; href: string } | 'current' | undefined = undefined
	export let features: string[] = []

	$: config = EVENT_TIER[tier]
	$: isCurrent = action === 'current'
	$: actionConfig = action && action !== 'current' ? action : null
	$: price = parsePrice(config.price)

	function parsePrice(priceStr: string): { value: string; unit?: string } {
		if (priceStr === 'Sur mesure') return { value: 'Sur mesure' }
		const [value, unit] = priceStr.split(' ')
		return { value, unit }
	}
</script>

<div class="card bg-base-100 border border-base-200 shadow-sm flex flex-col">
	<div class="card-body flex flex-col flex-1">
		<div class="flex-1">
			<div class="flex items-start justify-between gap-3">
				<h3 class="text-xl font-bold text-base-content">{config.label}</h3>
				{#if isCurrent}
					<span class="badge badge-primary">Plan actif</span>
				{/if}
			</div>

			<div class="mt-2 flex items-baseline gap-1">
				<span class="text-4xl font-extrabold text-primary tracking-tight">
					{price.value}
				</span>
				{#if price.unit}
					<span class="text-lg text-base-content/60">{price.unit}</span>
				{/if}
			</div>

			<ul class="mt-4 space-y-2 text-base-content/80">
				<li class="flex items-start gap-2">
					{#if config.max === null}
						<Infinity class="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
						<span>
							Bénévoles <span class="font-bold text-primary">illimités</span>
						</span>
					{:else}
						<Check class="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
						<span>Jusqu'à {config.max} bénévoles</span>
					{/if}
				</li>
				{#each features as feature}
					<li class="flex items-start gap-2">
						<Check class="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
						<span>{feature}</span>
					</li>
				{/each}
			</ul>
		</div>

		{#if actionConfig}
			<a href={actionConfig.href} class="btn btn-outline btn-primary mt-6 w-full">
				{actionConfig.label}
			</a>
		{:else if isCurrent}
			<button class="btn btn-outline btn-primary mt-6 w-full" disabled>Plan actif</button>
		{/if}
	</div>
</div>
