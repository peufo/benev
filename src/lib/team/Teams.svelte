<script lang="ts">
	import { fade } from 'svelte/transition'
	import { mdiPencilOutline } from '@mdi/js'

	import type { TeamWithComputedValues } from '$lib/server'
	import type { Member } from '@prisma/client'
	import { Placeholder, Icon, urlParam, tip } from 'fuma'
	import { eventPath, onlyAvailable } from '$lib/store'

	import Progress from '$lib/Progress.svelte'
	import { formatRange } from '$lib/formatRange'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { derived } from 'svelte/store'
	import TeamCard from './TeamCard.svelte'

	export let teams: (TeamWithComputedValues & {
		leaders: (Member & {
			user: { firstName: string; lastName: string; email: string; phone: string | null }
		})[]
	})[]

	/** By pass $onlyAvailable flag */
	export let showAll = false

	$: _teams = teams.filter((team) => {
		if (!$onlyAvailable || showAll) return true
		return team.isAvailable
	})
</script>

{#if _teams.length}
	{#each _teams as team (team.id)}
		<TeamCard {team} />
	{/each}
{:else}
	<Placeholder>
		<span>Pas de secteurs</span>
	</Placeholder>
{/if}
