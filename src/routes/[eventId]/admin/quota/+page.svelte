<script lang="ts">
	import type { EventTier } from '@prisma/client'
	import { EventTierDetails, TierCard } from '$lib/event'
	import { EVENT_TIER } from '$lib/constant'

	export let data

	$: ({ event, member, membersValided, userIsRoot } = data)
	$: isOwner = member?.roles.includes('owner') || userIsRoot
	$: upgradeOptions = getUpgradeOptions(event.tier)

	function getUpgradeOptions(currentTier: EventTier): { tier: EventTier; priceId: string }[] {
		if (currentTier === 'premium' || currentTier === 'pro') return []
		const targets: EventTier[] = currentTier === 'basic' ? ['standard', 'premium'] : ['premium']
		return targets
			.map((target) => ({
				tier: target,
				priceId:
					EVENT_TIER[target].upgradePriceId?.[currentTier] || EVENT_TIER[target].priceId || '',
			}))
			.filter((option) => option.priceId)
	}

	function upgradeFeatures(tier: EventTier): string[] {
		if (tier === 'standard') return ['Support email — réponse en 5 jours ouvrables']
		if (tier === 'premium') return ['Support email 7/7 — réponse en 24h']
		return []
	}
</script>

<div class="max-w-4xl mx-auto p-6 flex flex-col gap-6">
	<EventTierDetails {event} {membersValided} />

	{#if isOwner && upgradeOptions.length}
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="card-title">Changer de plan</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
					{#each upgradeOptions as option}
						<TierCard
							tier={option.tier}
							features={upgradeFeatures(option.tier)}
							action={{
								label: `Passer à ${EVENT_TIER[option.tier].label}`,
								href: `/me/checkouts/create?price=${option.priceId}&eventId=${event.id}`,
							}}
						/>
					{/each}
				</div>
			</div>
		</div>
	{:else if !isOwner}
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<p class="text-sm opacity-70">Seul le propriétaire peut changer de plan.</p>
			</div>
		</div>
	{/if}
</div>
