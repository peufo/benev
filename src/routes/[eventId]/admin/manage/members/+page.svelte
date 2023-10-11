<script lang="ts">
	import { Icon, Pagination } from '$lib/material'
	import { urlParam } from '$lib/store'
	import { slide } from 'svelte/transition'
	import Members from './Members.svelte'
	import MembersCopy from './MembersCopy.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'
	import { mdiSigma } from '@mdi/js'

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

	let selectedColumnsId: string[]
</script>

<div class="flex flex-col gap-4">
	<div class="flex gap-x-3 gap-y-2 flex-wrap">
		<MembersFilter fields={data.fields} teams={data.teams} />
		<MembersCopy members={data.members} fields={data.fields} {selectedColumnsId} />

		<a
			class="
				btn btn-sm btn-square join-item
				{!$urlParam.hasValue('summary', 'hidden') ? 'btn-active' : 'opacity-70'}
			"
			href={$urlParam.toggle({ summary: 'hidden' })}
			data-sveltekit-noscroll
		>
			<Icon
				path={mdiSigma}
				title="{$urlParam.hasValue('summary', 'hidden')
					? 'Afficher'
					: 'Cacher'}Afficher la synthèse"
				class="fill-base-content"
			/>
		</a>
	</div>

	{#if !$urlParam.hasValue('summary', 'hidden')}
		<div transition:slide={{ duration: 150 }}>
			<MembersStats {data} {workTimes} />
		</div>
	{/if}

	<Members members={data.members} fields={data.fields} {workTimes} bind:selectedColumnsId />

	<div class="flex justify-end">
		<Pagination />
	</div>
</div>
