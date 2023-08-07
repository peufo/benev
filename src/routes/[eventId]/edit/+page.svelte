<script lang="ts">
	import { goto } from '$app/navigation'
	import { eventPath } from '$lib/store'
	import EventForm from '../../EventForm.svelte'

	export let data
</script>

<EventForm
	isUpdate
	successReset={false}
	event={data.event}
/>
