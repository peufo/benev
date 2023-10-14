<script lang="ts">
	import { InputSearch, Pagination } from '$lib/material'

	import Filters from './Filters.svelte'
	import Subscribes from './Subscribes.svelte'

	export let data
</script>

<div class="flex flex-col gap-3">
	<div class="flex gap-x-3 gap-y-2 flex-wrap">
		<InputSearch />
		<Filters teams={data.teams} />
	</div>

	<Subscribes subscribes={data.subscribes} />

	<div class="flex justify-end">
		<Pagination />
	</div>
</div>
