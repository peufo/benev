<script lang="ts">
	import type { Team } from '@prisma/client'
	import { DisplayToggle, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import {
		mdiAccountMultipleOutline,
		mdiChartGantt,
		mdiClipboardTextMultipleOutline,
		mdiPencilOutline,
	} from '@mdi/js'
	import { MemberSetLeaderOf } from '$lib/member'

	export let teams: Team[]

	$: teamsId = JSON.stringify(teams.map((team) => team.id))

	let teamDialog: HTMLDialogElement
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
	<button type="button" class="btn btn-square btn-sm" on:click={() => teamDialog.showModal()}>
		<Icon path={mdiPencilOutline} title="Éditer les secteurs à charge" />
	</button>
{/if}

<MemberSetLeaderOf bind:dialog={teamDialog} {teams} />
