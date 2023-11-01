<script lang="ts">
	import {  mdiPlus } from '@mdi/js'
	import { Card, DisplayToggle, Icon, InputSearch } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Teams from '$lib/Teams.svelte'
	import OnlyAvailableToggle from '$lib/material/display/OnlyAvailableToggle.svelte'

	export let data

	$: memberCanCreate = ['owner', 'admin'].includes(data.member?.role || '') 

</script>

<Card class="max-w-4xl m-auto">
	<span slot="title">Secteurs</span>

	<div slot="action" class="flex gap-2">


		<OnlyAvailableToggle/>
		<DisplayToggle />
		<InputSearch />

		{#if memberCanCreate}
			<a href="{$eventPath}/teams/create" class="btn btn-sm btn-square">
				<Icon path={mdiPlus} title="Nouveau secteur" />
			</a>
		{/if}
	</div>

	<div class="overflow-x-auto">
		<Teams teams={data.teams} />
	</div>
</Card>
