<script lang="ts">
	import { Card } from '$lib/material'
	import { EventForm } from '$lib/event'

	import EventStateForm from './EventStateForm.svelte'
	import OnlyAdmin from '../OnlyAdmin.svelte'

	export let data
</script>

<OnlyAdmin>
	<div class="mx-auto flex flex-col gap-4" style="min-width: min(100%, 600px)">
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
