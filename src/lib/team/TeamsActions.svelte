<script lang="ts">
	import { DisplayToggle, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import {
		mdiAccountMultipleOutline,
		mdiChartGantt,
		mdiClipboardTextMultipleOutline,
	} from '@mdi/js'

	export let teams: { id: string }[]

	$: teamsId = JSON.stringify(teams.map((team) => team.id))
</script>

{#if teams.length}
	<DisplayToggle />
	<a href="{$eventPath}/admin/members?teams={teamsId}" class="btn btn-square btn-sm">
		<Icon path={mdiAccountMultipleOutline} title="Tous les membres de ces secteurs" />
	</a>
	<a href="{$eventPath}/admin/subscribes?teams={teamsId}" class="btn btn-square btn-sm">
		<Icon path={mdiClipboardTextMultipleOutline} title="Toutes les inscriptions de ces secteurs" />
	</a>
	<a href="{$eventPath}/admin/plan?teams={teamsId}" class="btn btn-square btn-sm">
		<Icon path={mdiChartGantt} size={20} title="Voir ces secteurs sur le planning" />
	</a>
{/if}
