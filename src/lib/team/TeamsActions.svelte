<script lang="ts">
	import { tip } from 'fuma'
	import { ChartGanttIcon, ClipboardCopyIcon, PencilIcon, UsersIcon } from '@lucide/svelte'
	import type { Team } from '@prisma/client'
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
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
		<span class="inline-flex" use:tip={{ content: 'Tous les membres de ces secteurs' }}
			><UsersIcon /></span
		>
	</a>
	<a href="{$eventPath}/admin/subscribes?teams={teamsId}" class="btn btn-square btn-sm">
		<span class="inline-flex" use:tip={{ content: 'Toutes les inscriptions de ces secteurs' }}
			><ClipboardCopyIcon /></span
		>
	</a>
	<a href="{$eventPath}/admin/plan?teams={teamsId}" class="btn btn-square btn-sm">
		<span class="inline-flex" use:tip={{ content: 'Voir ces secteurs sur le planning' }}
			><ChartGanttIcon size={20} /></span
		>
	</a>
{/if}

{#if $page.data.member?.roles.includes('admin')}
	<button type="button" class="btn btn-square btn-sm" onclick={() => teamDialog.showModal()}>
		<span class="inline-flex" use:tip={{ content: 'Éditer les secteurs à charge' }}
			><PencilIcon /></span
		>
	</button>
{/if}

<MemberSetLeaderOf bind:dialog={teamDialog} {teams} {memberId} />
