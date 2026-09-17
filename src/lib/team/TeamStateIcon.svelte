<script lang="ts">
	import type { Team } from '@prisma/client'
	import { tip } from 'fuma'
	import { TEAM_STATES } from '$lib/constant'

	interface Props {
		team: Pick<Team, 'state'>
		size?: number
	}

	let { team, size = 16 }: Props = $props()

	const StateIcon = $derived(TEAM_STATES[team.state].icon)
</script>

<span class="inline-flex shrink-0" use:tip={{ content: TEAM_STATES[team.state].label }}>
	<StateIcon {size} class={TEAM_STATES[team.state].class} />
</span>
