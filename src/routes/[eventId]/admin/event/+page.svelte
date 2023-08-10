<script lang="ts">
	import EventForm from '../../../EventForm.svelte'

	export let data
</script>

<div class="flex justify-center">
	<EventForm
		isUpdate
		successReset={false}
		event={data.event}
		class="grow"
	/>
</div>

