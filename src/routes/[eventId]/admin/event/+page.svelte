<script lang="ts">
	import { Card } from '$lib/material'
	import { EventForm } from '$lib/event'

	import EventStateForm from './EventStateForm.svelte'
	import OnlyAdmin from '../OnlyAdmin.svelte'

	export let data
</script>

<OnlyAdmin>
	<div class="grid gap-6 pt-4 place-content-center justify-stretch pb-36 px-0 md:px-20 lg:px-48">
		<EventStateForm
			event={data.event}
			eventCounts={data.eventCounts}
			eventLicenceAvailable={!!data.eventLicenceAvailable}
		/>

		<Card>
			<EventForm successReset={false} event={data.event} class="grow" />
		</Card>
	</div>
</OnlyAdmin>
