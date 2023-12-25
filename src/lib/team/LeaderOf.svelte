<script lang="ts">
	import { Card } from '$lib/material'
	import { Teams, TeamsActions } from '$lib/team'
	import type { Event, Member, Period, Subscribe, Team } from '@prisma/client'

	export let teams: (Team & {
		leaders: (Member & {
			user: { firstName: string; lastName: string; email: string; phone: string | null }
		})[]
		periods: (Period & { subscribes: Subscribe[] })[]
	})[]
	export let event: Event
</script>

<Card class="border bordered">
	<h2 slot="title">Secteurs à charge</h2>

	<div slot="action" class="flex gap-2">
		{#if teams.length}
			<TeamsActions {teams} />
		{/if}
	</div>
	<Teams {teams} {event} showAll />
</Card>
