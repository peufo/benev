<script lang="ts">
	import type { Event, EventTier } from '@prisma/client'
	import { Users, Infinity, ChevronRight, TriangleAlert } from 'lucide-svelte'
	import { EVENT_TIER } from '$lib/constant'
	import { env } from '$env/dynamic/public'

	export let event: Event
	export let membersValided: number
	export let isOwner = false

	$: tier = EVENT_TIER[event.tier]
	$: max = tier.max
	$: ratio = max ? membersValided / max : 0
	$: status = ratio >= 0.9 ? 'error' : ratio >= 0.8 ? 'warning' : 'success'
	$: statusClass = {
		error: 'border-error bg-error/10 text-error',
		warning: 'border-warning bg-warning/10 text-warning',
		success: 'border-success bg-success/10 text-success',
	}[status]
	$: progressClass = {
		error: 'progress-error',
		warning: 'progress-warning',
		success: 'progress-success',
	}[status]

	$: upgradeOptions = getUpgradeOptions(event.tier)
	function getUpgradeOptions(currentTier: EventTier): { tier: EventTier; priceId: string }[] {
		if (currentTier === 'premium' || currentTier === 'pro') return []
		if (currentTier === 'standard')
			return [{ tier: 'premium', priceId: env.PUBLIC_PRICE_STANDARD_TO_PREMIUM }]
		return [
			{ tier: 'standard', priceId: env.PUBLIC_PRICE_STANDARD },
			{ tier: 'premium', priceId: env.PUBLIC_PRICE_PREMIUM },
		]
	}
</script>

<div
	class="
		group max-w-[60px] hover:max-w-52 max-h-[60px] hover:max-h-[280px]
		transition-[max-width,max-height] duration-300 overflow-hidden
		rounded-2xl border border-base-200 bg-base-100 shadow-sm shrink-0 cursor-default
	"
>
	<div class="w-52">
		<div class="flex">
			<div
				class="
					w-[58px] h-[58px] flex items-center justify-center shrink-0
					group-hover:m-1 border-2 rounded-[15px] group-hover:rounded-xl
					transition-[margin]
					{statusClass}
				"
				title="Plan {tier.label}"
			>
				<span class="text-xs font-medium leading-none flex items-center gap-0.5">
					{membersValided} /
					{#if max !== null}
						{max}
					{:else}
						<Infinity size={14} />
					{/if}
				</span>
			</div>

			<div
				class="
					px-3 flex flex-col justify-center gap-0.5
					opacity-0 group-hover:opacity-100 transition-opacity duration-300
				"
			>
				<span class="font-semibold text-sm leading-tight">{tier.label}</span>
				<span class="text-xs opacity-70 leading-tight">Plan actif</span>
			</div>
		</div>

		<div
			class="
				px-3 pt-2 pb-3 flex flex-col gap-2
				opacity-0 group-hover:opacity-100 transition-opacity duration-300
			"
		>
			<div class="flex items-center gap-1.5 text-xs opacity-80">
				<Users size={12} />
				<span>
					{membersValided}
					{#if max !== null}
						/ {max}
					{/if}
					bénévoles validés
				</span>
			</div>

			{#if max !== null}
				<progress
					class="progress progress-xs w-full {progressClass}"
					value={membersValided}
					{max}
				/>
			{/if}

			{#if max === null}
				<p class="text-xs opacity-70">Aucune limite de bénévoles.</p>
			{:else if status !== 'success'}
				<p
					class="text-xs flex items-start gap-1.5 {status === 'error'
						? 'text-error'
						: 'text-warning'}"
				>
					<TriangleAlert size={12} class="shrink-0 mt-0.5" />
					{Math.round(ratio * 100)} % de la limite utilisée.
				</p>
			{/if}

			{#if isOwner && upgradeOptions.length}
				<div class="mt-1 flex flex-col gap-1.5">
					{#each upgradeOptions as option}
						{@const optionTier = EVENT_TIER[option.tier]}
						<a
							href="/me/checkouts/create?price={option.priceId}&eventId={event.id}"
							class="btn btn-xs btn-primary justify-between"
						>
							<span>Passer à {optionTier.label}</span>
							<ChevronRight size={14} />
						</a>
					{/each}
				</div>
			{:else if !isOwner}
				<p class="text-[10px] opacity-60">Seul le propriétaire peut changer de plan.</p>
			{/if}
		</div>
	</div>
</div>
