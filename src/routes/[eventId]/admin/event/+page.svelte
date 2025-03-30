<script lang="ts">
	import { Card } from 'fuma'
	import { EventForm } from '$lib/event'

	import EventStateForm from './EventStateForm.svelte'
	import OnlyAdmin from '../OnlyAdmin.svelte'

	export let data
</script>

<OnlyAdmin>
	<div class="mx-auto flex flex-col gap-2 sm:gap-4" style="min-width: min(100%, 600px)">
		<EventStateForm
			isOwner={data.member?.user.id == data.event.ownerId}
			event={data.event}
			eventCounts={data.eventCounts}
			eventLicenceAvailable={!!data.eventLicenceAvailable}
		/>

		<Card>
			<EventForm event={data.event} />
		</Card>
	</div>
</OnlyAdmin>
