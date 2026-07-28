<script lang="ts">
	import type { Team } from '@prisma/client'
	import { page } from '$app/stores'
	import { Icon } from '$lib/fuma-legacy'
	import { eventPath } from '$lib/store'
	import {
		mdiAccountMultipleOutline,
		mdiChartGantt,
		mdiClipboardTextMultipleOutline,
		mdiPencilOutline,
	} from '@mdi/js'
	import { MemberSetLeaderOf } from '$lib/member'

	interface Props {
		teams: Team[]
		// memberId used in actions
		memberId: string
	}

	let { teams, memberId }: Props = $props()

	let teamsId = $derived(JSON.stringify(teams.map((team) => team.id)))

	let teamDialog: HTMLDialogElement = $state()!
</script>

{#if teams.length}
	<a href="{$eventPath}/admin/members?subscribes_teams={teamsId}" class="btn btn-square btn-sm">
		<Icon path={mdiAccountMultipleOutline} title="Tous les membres de ces secteurs" />
	</a>
	<a href="{$eventPath}/admin/subscribes?teams={teamsId}" class="btn btn-square btn-sm">
		<Icon path={mdiClipboardTextMultipleOutline} title="Toutes les inscriptions de ces secteurs" />
	</a>
	<a href="{$eventPath}/admin/plan?teams={teamsId}" class="btn btn-square btn-sm">
		<Icon path={mdiChartGantt} size={20} title="Voir ces secteurs sur le planning" />
	</a>
{/if}

{#if $page.data.member?.roles.includes('admin')}
	<button type="button" class="btn btn-square btn-sm" onclick={() => teamDialog.showModal()}>
		<Icon path={mdiPencilOutline} title="Éditer les secteurs à charge" />
	</button>
{/if}

<MemberSetLeaderOf bind:dialog={teamDialog} {teams} {memberId} />
