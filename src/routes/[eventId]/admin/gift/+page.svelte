<script lang="ts">
	import { GiftIcon } from '@lucide/svelte'
	import { Card } from '$lib/fuma-legacy'

	import { GiftConfiguration } from '$lib/gift'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import OnlyAdmin from '../OnlyAdmin.svelte'

	let { data } = $props()
</script>

<OnlyAdmin>
	<Card class="mx-auto" style="min-width: min(100%, 600px)">
		{#snippet title()}
			<span class="flex gap-3">
				<GiftIcon class="opacity-70 -rotate-6" />
				Prestations offertes
			</span>
		{/snippet}
		{#snippet subtitle()}
			<span> Liste et configuration des compensations auxquelles les membres ont droit </span>
		{/snippet}

		<WorkInProgress />
		<GiftConfiguration gifts={data.gifts} />
	</Card>
</OnlyAdmin>
