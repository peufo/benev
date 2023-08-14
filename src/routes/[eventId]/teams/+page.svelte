<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Teams from '$lib/Teams.svelte'

	export let data
</script>

<div class="p-4 card bg-base-100 max-w-4xl m-auto">
	<div class="flex gap-2 py-2 items-center">
		<h2 class="text-2xl">Secteurs</h2>
		<div class="grow" />
		{#if data.isOwner}
			<a href="{$eventPath}/teams/create" class="btn btn-neutral">
				<Icon path={mdiPlus} class="fill-neutral-content" />
				Ajouter un secteur
			</a>
		{/if}
	</div>

	<div class="divider" />

	<Teams teams={data.teams} isOwner={data.isOwner} />
</div>
