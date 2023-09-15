<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { Card, Icon, InputSearch } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Teams from '$lib/Teams.svelte'

	export let data
</script>

<Card class="max-w-4xl m-auto">
	<span slot="title">Secteurs</span>

	<div slot="action" class="flex gap-2">
		<InputSearch />

		{#if data.isOwner}
			<a href="{$eventPath}/teams/create" class="btn btn-sm">
				<Icon path={mdiPlus} />
				Nouveau
			</a>
		{/if}
	</div>

	<div class="overflow-x-auto">
		<Teams teams={data.teams} />
	</div>
</Card>
