<script lang="ts">
	import { EventForm } from '$lib/event'

	import EventStateForm from './EventStateForm.svelte'
	import OnlyAdmin from '../OnlyAdmin.svelte'

	export let data
</script>

<OnlyAdmin>
	<div class="mx-auto flex flex-col gap-2 sm:gap-4" style="min-width: min(100%, 600px)">
		<EventStateForm isOwner={data.member?.userId == data.event.ownerId} event={data.event} />

		<EventForm event={data.event} />
	</div>
</OnlyAdmin>
