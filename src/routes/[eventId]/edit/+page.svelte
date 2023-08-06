<script lang="ts">
	import { goto } from '$app/navigation'
	import { eventPath } from '$lib/store'
	import EventForm from '../../EventForm.svelte'

	export let data
</script>

<div class="card bg-base-100 max-w-lg m-auto">
	<div class="card-body">
		<EventForm
			isUpdate
			event={data.event}
			successUpdate={false}
			on:success={() => {
				goto(`${$eventPath}/admin`, { invalidateAll: true })
			}}
		/>
	</div>
</div>
