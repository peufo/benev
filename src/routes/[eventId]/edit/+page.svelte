<script lang="ts">
	import { goto } from '$app/navigation'
	import { eventPath } from '$lib/store'
	import EventForm from '../../EventForm.svelte'
	import Pages from './Pages.svelte';

	export let data
</script>

<div class="flex flex-wrap gap-4 mx-auto items-start justify-center">

	<div class="card bg-base-100 max-w-md grow">
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
	
	<Pages pages={data.pages} />

</div>

