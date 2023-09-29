<script lang="ts">
	import WorkInProgress from '$lib/WorkInProgress.svelte'

	import Filters from './Filters.svelte'
	import Subscribes from './Subscribes.svelte'

	export let data
</script>

<WorkInProgress />
<div class="flex flex-col gap-4">
	<div class="flex gap-x-3 gap-y-2 flex-wrap">
		<Filters teams={data.teams} />
	</div>

	<Subscribes subscribes={data.subscribes} />
</div>
