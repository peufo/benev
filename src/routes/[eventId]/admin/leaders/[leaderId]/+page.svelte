<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'

	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Teams from '$lib/Teams.svelte'

	export let data
</script>

<div class="flex gap-2 mb-2 items-center">
	<a href="{$eventPath}/admin/leaders" class="btn btn-xs btn-ghost pl-0">
		<Icon path={mdiArrowLeft} size={16} />
		Les responsables
	</a>
	<a
		href="{$eventPath}/admin?teams={JSON.stringify(data.leader.leadersOf.map((l) => l.teamId))}"
		class="btn btn-xs"
	>
		Les bénévoles de ces secteurs
	</a>
</div>

<h2 class="text-2xl">
	Secteurs de
	<span class="font-bold">
		{data.leader.firstName}
		{data.leader.lastName}
	</span>
</h2>

<Teams teams={data.leader.leadersOf.map((l) => l.team)} isOwner={data.isOwner} />
