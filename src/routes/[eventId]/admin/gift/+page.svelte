<script lang="ts">
	import { mdiGiftOutline } from '@mdi/js'

	import { Card, Icon } from '$lib/fuma'

	import { GiftConfiguration } from '$lib/gift'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import OnlyAdmin from '../OnlyAdmin.svelte'

	let { data } = $props()
</script>

<OnlyAdmin>
	<Card class="mx-auto" style="min-width: min(100%, 600px)">
		{#snippet title()}
			<span class="flex gap-3">
				<Icon path={mdiGiftOutline} class="opacity-70 -rotate-6" />
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
