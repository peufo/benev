<script lang="ts">
	import { mdiGiftOutline } from '@mdi/js'

	import { Card, Icon } from '$lib/material'

	import { GiftConfiguration } from '$lib/gift'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import OnlyAdmin from '../OnlyAdmin.svelte'

	export let data
</script>

<OnlyAdmin>
	<Card class="mx-auto" style="min-width: min(100%, 600px)">
		<span slot="title" class="flex gap-3">
			<Icon path={mdiGiftOutline} class="opacity-70 -rotate-6" />
			Prestations offertes
		</span>
		<span slot="subtitle">
			Liste et configuration des compensations auxquelles les membres ont droit
		</span>

		<WorkInProgress />
		<GiftConfiguration gifts={data.gifts} />
	</Card>
</OnlyAdmin>
