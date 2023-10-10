<script lang="ts">
	import { mdiEyeCheckOutline,mdiEyeOutline, mdiPlus } from '@mdi/js'
	import { Card, DisplayToggle, Icon, InputSearch } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Teams from '$lib/Teams.svelte'

	export let data

	let onlyAvailableTeams = true
</script>

<Card class="max-w-4xl m-auto">
	<span slot="title">Secteurs</span>

	<div slot="action" class="flex gap-2">
		<button
			class="btn btn-sm btn-square"
			class:btn-active={onlyAvailableTeams}
			on:click={() => (onlyAvailableTeams = !onlyAvailableTeams)}
		>
			<Icon
				path={onlyAvailableTeams ? mdiEyeCheckOutline : mdiEyeOutline}
				size={22}
				title={onlyAvailableTeams
					? 'Montrer les secteurs indisponibles'
					: 'Cacher les secteurs indisponibles'}
			/>
		</button>

		<DisplayToggle />
		<InputSearch />

		{#if data.isOwner}
			<a href="{$eventPath}/teams/create" class="btn btn-sm btn-square">
				<Icon path={mdiPlus} title="Nouveau secteur" />
			</a>
		{/if}
	</div>

	<div class="overflow-x-auto">
		<Teams teams={data.teams} {onlyAvailableTeams} />
	</div>
</Card>
