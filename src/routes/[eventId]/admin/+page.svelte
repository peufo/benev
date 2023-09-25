<script lang="ts">
	import { Card } from '$lib/material'
	import Members from './Members.svelte'
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
	<Card>
		<span slot="title">Synthèse</span>

		<MembersStats {data} {workTimes} />
	</Card>

	<Members members={data.members} fields={data.fields} teams={data.teams} {workTimes} />
</div>
