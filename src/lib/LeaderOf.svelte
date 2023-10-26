<script lang="ts">
	import { Card, DisplayToggle, Icon } from '$lib/material'
	import Teams from '$lib/Teams.svelte'
	import { Member, Period, Subscribe, Team } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import {
		mdiAccountMultipleOutline,
		mdiChartGantt,
		mdiClipboardTextMultipleOutline,
	} from '@mdi/js'

	export let teams: (Team & {
		leaders: (Member & {
			user: { firstName: string; lastName: string; email: string; phone: string | null }
		})[]
		periods: (Period & { subscribes: Subscribe[] })[]
	})[]

	$: teamsId = JSON.stringify(teams.map((team) => team.id))
</script>

<Card class="border">
	<h2 slot="title">Secteurs à charge</h2>

	<div slot="action" class="flex gap-2">
		{#if teams.length}
			<DisplayToggle />
			<a href="{$eventPath}/admin/members?teams={teamsId}" class="btn btn-square btn-sm">
				<Icon path={mdiAccountMultipleOutline} title="Tous les membres de ces secteurs" />
			</a>
			<a href="{$eventPath}/admin/subscribes?teams={teamsId}" class="btn btn-square btn-sm">
				<Icon
					path={mdiClipboardTextMultipleOutline}
					title="Toutes les inscriptions de ces secteurs"
				/>
			</a>
			<a href="{$eventPath}/admin/plan?teams={teamsId}" class="btn btn-square btn-sm">
				<Icon path={mdiChartGantt} size={20} title="Voir ces secteurs sur le planning" />
			</a>
		{/if}
	</div>
	<Teams {teams} showAll />
</Card>
