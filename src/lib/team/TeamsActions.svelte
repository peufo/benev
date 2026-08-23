<script lang="ts">
	import { tip } from 'fuma'
	import { ChartGanttIcon, ClipboardCopyIcon, UsersIcon } from '@lucide/svelte'
	import type { Team } from '@prisma/client'
	import { eventPath } from '$lib/eventPath'

	interface Props {
		teams: Team[]
	}

	let { teams }: Props = $props()

	let teamsId = $derived(JSON.stringify(teams.map((team) => team.id)))
</script>

{#if teams.length}
	<a
		href={eventPath(`/admin/members?subscribes_teams=${teamsId}`)}
		class="btn btn-square btn-sm"
		use:tip={{ content: 'Tous les membres de ces secteurs' }}
	>
		<UsersIcon />
	</a>
	<a
		href={eventPath(`/admin/subscribes?teams=${teamsId}`)}
		class="btn btn-square btn-sm"
		use:tip={{ content: 'Toutes les inscriptions de ces secteurs' }}
	>
		<ClipboardCopyIcon />
	</a>
	<a
		href={eventPath(`/admin/plan?teams=${teamsId}`)}
		class="btn btn-square btn-sm"
		use:tip={{ content: 'Voir ces secteurs sur le planning' }}
	>
		<ChartGanttIcon size={20} />
	</a>
{/if}
