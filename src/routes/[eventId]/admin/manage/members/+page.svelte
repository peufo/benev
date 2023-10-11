<script lang="ts">
	import { mdiSigma } from '@mdi/js'
	import { slide } from 'svelte/transition'
	
	import type { PageData } from './$types'
	import { Icon, Pagination } from '$lib/material'
	import { urlParam } from '$lib/store'
	import Members from './Members.svelte'
	import MembersCopy from './MembersCopy.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'
	import ColumnsSelect, { type Column } from '$lib/ColumnsSelect.svelte'
	import { getAge } from '$lib/utils'
	import { jsonParse } from '$lib/jsonParse'

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

	const defaultColumnsId = ['periods', 'hours', 'sectors']
	let selectedColumnsId = defaultColumnsId

	type Member = PageData['members'][number]
	const toHour = (ms: number) => ms / (1000 * 60 * 60)
	const columns: Record<string, Column<Member>> = {
		periods: { label: 'Périodes', getValue: (m) => m.subscribes.length },
		hours: { label: 'Heures', getValue: (m) => toHour(workTimes[m.id]) },
		sectors: { label: 'Secteurs à charges', getValue: (m) => m.leaderOf.map(({ name }) => name) },
		age: { label: 'Age', getValue: (m) => getAge(m.user.birthday) },
		...data.fields.reduce(
			(acc, cur) => ({
				...acc,
				[cur.id]: {
					label: cur.name,
					getValue: (m: Member) => {
						const { value } = m.profile.find((f) => f.fieldId === cur.id) || { value: '' }
						if (!value) return ''
						if (cur.type === 'multiselect') return jsonParse(value, [])
						if (cur.type === 'boolean') return value === 'true'
						if (cur.type === 'number') return +value
						return value
					},
				},
			}),
			{}
		),
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex gap-x-3 gap-y-2 flex-wrap">
		<MembersFilter fields={data.fields} teams={data.teams} />
		<MembersCopy members={data.members} fields={data.fields} {selectedColumnsId} />
		<ColumnsSelect {columns} {defaultColumnsId} bind:selectedColumnsId />

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

	<Members members={data.members} {columns} bind:selectedColumnsId />

	<div class="flex justify-end">
		<Pagination />
	</div>
</div>
