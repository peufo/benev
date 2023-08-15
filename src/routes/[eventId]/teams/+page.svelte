<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Teams from '$lib/Teams.svelte'

	export let data
</script>

<div class="card p-4 md:p-10 bg-base-100 max-w-4xl m-auto">
	<div class="flex flex-col gap-2">
		<div class="flex">
			<h2 class="text-2xl">Secteurs</h2>
			<div class="grow" />
			{#if data.isOwner}
				<a href="{$eventPath}/teams/create" class="btn btn-neutral">
					<Icon path={mdiPlus} class="fill-neutral-content" />
					Ajouter un secteur
				</a>
			{/if}
		</div>

		<Teams teams={data.teams} isOwner={data.isOwner} />
	</div>
</div>
