<script lang="ts">
	import { InputSearch, Pagination } from '$lib/material'

	import Filters from './Filters.svelte'
	import Subscribes from './Subscribes.svelte'
	import SubscribesCopy from './SubscribesCopy.svelte'

	export let data
</script>

<div class="flex flex-col gap-3">
	<div class="flex gap-x-2 gap-y-2 flex-wrap">
		<InputSearch />
		<Filters teams={data.teams} />
		<SubscribesCopy />
	</div>

	<Subscribes subscribes={data.subscribes} />

	<div class="flex justify-end">
		<Pagination />
	</div>
</div>
