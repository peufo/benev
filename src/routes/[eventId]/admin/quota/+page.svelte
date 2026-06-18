<script lang="ts">
	import { TriangleAlert } from 'lucide-svelte'
	import { EventTierMenu } from '$lib/event'
	import { EVENT_TIER } from '$lib/constant'

	export let data

	$: ({ event, member, membersValided, userIsRoot } = data)
	$: tier = EVENT_TIER[event.tier]
	$: max = tier.max
	$: isOwner = member?.roles.includes('owner') || userIsRoot
</script>

<div class="max-w-2xl mx-auto p-6 flex flex-col gap-6">
	<div class="alert alert-error">
		<TriangleAlert size={24} />
		<div>
			<h1 class="text-xl font-bold">Quota de bénévoles atteint</h1>
			<p>Ton événement a atteint la limite du plan <strong>{tier.label}</strong>.</p>
		</div>
	</div>

	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<h2 class="card-title">Récapitulatif</h2>
			<p>
				{membersValided}
				{#if max !== null}
					/ {max}
				{/if}
				bénévoles validés
			</p>
			<p class="text-sm opacity-80">
				L'accès à l'administration de cet événement est temporairement restreint. Les bénévoles
				peuvent toujours s'inscrire. Passe à un plan supérieur pour retrouver toutes les
				fonctionnalités.
			</p>
		</div>
	</div>

	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<h2 class="card-title">Changer de plan</h2>
			<EventTierMenu {event} {membersValided} {isOwner} />
			{#if !isOwner}
				<p class="text-sm opacity-70 mt-2">Seul le propriétaire peut changer de plan.</p>
			{/if}
		</div>
	</div>
</div>
