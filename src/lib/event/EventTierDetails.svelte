<script lang="ts">
	import type { Event } from '@prisma/client'
	import { Users, Infinity, TriangleAlert } from 'lucide-svelte'
	import { EVENT_TIER } from '$lib/constant'

	export let event: Event
	export let membersValided: number

	$: tier = EVENT_TIER[event.tier]
	$: ratio = tier.max ? membersValided / tier.max : 0
	$: klass =
		ratio >= 0.9
			? 'text-error progress-error'
			: ratio >= 0.8
			? 'text-warning progress-warning'
			: 'progress-success'
</script>

<div class="card bg-base-100 shadow">
	<div class="card-body">
		<h2 class="card-title">Plan actif</h2>

		<div class="flex items-center gap-2 text-lg font-semibold">
			<span>{tier.label}</span>
			<span class="text-base-content/60">— {tier.price}</span>
		</div>

		<div class="mt-4 flex items-center gap-1.5 text-sm opacity-80">
			<Users size={16} />
			<span>
				{membersValided}
				{#if tier.max !== null}
					/ {tier.max}
				{:else}
					<Infinity size={14} class="inline" />
				{/if}
				bénévoles validés
			</span>
		</div>

		{#if tier.max !== null}
			<progress
				class="progress progress-md w-full mt-3 {klass}"
				value={membersValided}
				max={tier.max}
			/>
			<p class="text-sm flex items-start gap-1.5 mt-2 {klass}">
				{#if ratio >= 0.8}
					<TriangleAlert size={16} class="shrink-0 mt-0.5" />
				{/if}
				{Math.round(ratio * 100)} % de la limite utilisée.
			</p>
		{:else}
			<p class="text-sm opacity-70 mt-2">Aucune limite de bénévoles.</p>
		{/if}
	</div>
</div>
