<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'

	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Teams from '$lib/Teams.svelte'

	export let data
</script>

<div class="flex">
	<a href="{$eventPath}/admin/leaders" class="btn btn-sm">
		<Icon path={mdiArrowLeft} />
		Les responsables
	</a>
</div>

<h2 class="text-2xl">
	Secteurs à la charge de
	<span class="font-bold">
		{data.leader.firstName}
		{data.leader.lastName}
	</span>
</h2>

<Teams teams={data.leader.leadersOf.map((l) => l.team)} isOwner={data.isOwner} />
