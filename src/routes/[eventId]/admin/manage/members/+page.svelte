<script lang="ts">
	import { Card } from '$lib/material'
	import { eventPath, urlParam } from '$lib/store'
	import { fade } from 'svelte/transition'
	import Members from './Members.svelte'
	import MembersCopy from './MembersCopy.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'

	export let data

	let workTimes: Record<string, number>
	$: workTimes = data.members.reduce(
		(times, user) => ({
			...times,
			[user.id]: user.subscribes.reduce((acc, { period }) => {
				const time = period.end.getTime() - period.start.getTime()
				return acc + time
			}, 0),
		}),
		{}
	)
</script>

<div class="flex flex-col gap-4">
	<div class="flex gap-x-3 gap-y-2 flex-wrap">
		<MembersFilter fields={data.fields} teams={data.teams} />
		<MembersCopy members={data.members} fields={data.fields} />
	</div>

	{#if $urlParam.hasValue('view', 'summary')}
		<div in:fade={{ duration: 150 }}>
			<MembersStats {data} {workTimes} />
		</div>
	{:else}
		<div in:fade={{ duration: 150 }}>
			<Members members={data.members} fields={data.fields} {workTimes} />
		</div>
	{/if}
</div>
