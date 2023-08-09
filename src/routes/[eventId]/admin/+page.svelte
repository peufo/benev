<script lang="ts">
	import EventForm from '../../EventForm.svelte'

	export let data
</script>

<EventForm
	isUpdate
	successReset={false}
	event={data.event}
/>
