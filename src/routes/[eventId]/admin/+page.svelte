<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'

	export let data
</script>

<div class="card bg-base-100">
	<div class="card-body">
		<div class="flex gap-2">
			<h2 class="text-xl">{data.event.name}</h2>
			<a href="{$eventPath}/edit" class="btn btn-square btn-sm">
				<Icon path={mdiPencilOutline} />
			</a>
		</div>

		<p>{data.event.description || ''}</p>
	</div>
</div>

<div class="card bg-base-100">
	<div class="card-body">
		<h2 class="text-xl">Pages</h2>
		Modifications des pages
	</div>
</div>
