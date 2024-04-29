<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { Card, Icon, InputSearch } from 'fuma'
	import { ToggleListOrTable, ToggleOnlyAvailable } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { Teams } from '$lib/team'

	export let data
</script>

<Card class="max-w-4xl m-auto">
	<span slot="title">Secteurs</span>

	<div slot="action" class="flex gap-2">
		<ToggleOnlyAvailable />
		<ToggleListOrTable />
		<InputSearch />

		{#if data.member?.roles.includes('admin')}
			<a href="{$eventPath}/teams/create" class="btn btn-sm btn-square">
				<Icon path={mdiPlus} title="Nouveau secteur" />
			</a>
		{/if}
	</div>

	<div class="overflow-x-auto">
		<Teams teams={data.teams} event={data.event} />
	</div>
</Card>
