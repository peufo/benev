<script lang="ts">
	import type { Event } from '@prisma/client'
	import { UsersIcon, InfinityIcon, TriangleAlertIcon } from '@lucide/svelte'
	import { EVENT_TIER } from '$lib/constant'

	interface Props {
		event: Event;
		membersValided: number;
	}

	let { event, membersValided }: Props = $props();

	let tier = $derived(EVENT_TIER[event.tier])
	let ratio = $derived(tier.max ? membersValided / tier.max : 0)
	let klass =
		$derived(ratio >= 0.9
			? 'text-error progress-error'
			: ratio >= 0.8
				? 'text-warning progress-warning'
				: 'progress-success')
</script>

<div class="card bg-base-100 shadow">
	<div class="card-body">
		<h2 class="card-title">
			<span>Plan {tier.label}</span>
			<span class="text-base-content/60">— {tier.price}</span>
		</h2>

		<div class="mt-4 flex items-center gap-1.5 text-sm opacity-80">
			<UsersIcon size={16} />
			<span>
				{membersValided}
				{#if tier.max !== null}
					/ {tier.max}
				{:else}
					<InfinityIcon size={14} class="inline" />
				{/if}
				bénévoles validés
			</span>
		</div>

		{#if tier.max !== null}
			<progress
				class="progress progress-md w-full mt-3 {klass}"
				value={membersValided}
				max={tier.max}
			></progress>
			<p class="text-sm flex items-start gap-1.5 mt-2 {klass}">
				{#if ratio >= 0.8}
					<TriangleAlertIcon size={16} class="shrink-0 mt-0.5" />
				{/if}
				{Math.round(ratio * 100)} % de la limite utilisée.
			</p>
		{:else}
			<p class="text-sm opacity-70 mt-2">Aucune limite de bénévoles.</p>
		{/if}

		{#if tier.max !== null && membersValided > tier.max}
			<p>L'interface admin est maintenant limitée, mais les bénévoles peuvent encore s'inscrire.</p>
		{/if}
	</div>
</div>
