<script lang="ts">
	import { mdiChevronRight, mdiSigma } from '@mdi/js'
	import { slide } from 'svelte/transition'
	import { derived } from 'svelte/store'
	import { navigating } from '$app/stores'

	import type { PageData } from './$types'
	import { Icon, InputSearch, Pagination } from '$lib/material'
	import { urlParam } from '$lib/store'
	import Members from './Members.svelte'
	import MembersCopy from './MembersCopy.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'
	import ColumnsSelect, { type Column } from '$lib/ColumnsSelect.svelte'
	import { getAge } from '$lib/utils'
	import { jsonParse } from '$lib/jsonParse'

	export let data

	let selectedColumnsId = ['periods', 'hours', 'sectors']

	type Member = PageData['members'][number]
	const toHour = (ms: number) => ms / (1000 * 60 * 60)
	const columns: Record<string, Column<Member>> = {
		periods: { label: 'Périodes', getValue: (m) => m.subscribes.length },
		hours: { label: 'Heures', getValue: (m) => toHour(m.workTime) },
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

	const summary = derived(urlParam, ({ has }) => has('summary'))
</script>

<div class="flex flex-col gap-4">
	<div class="flex gap-x-3 gap-y-2 flex-wrap">
		<InputSearch />
		<MembersFilter fields={data.fields} teams={data.teams} />

		<ColumnsSelect {columns} bind:selectedColumnsId />

		<a
			class="
				btn btn-sm fill-base-content px-1
				{$summary ? 'btn-active' : 'opacity-70'}
			"
			href={$urlParam.toggle({ summary: 'true' })}
			data-sveltekit-noscroll
		>
			<Icon path={mdiSigma} title="Synthèse" />
			<Icon path={mdiChevronRight} class={$summary ? 'rotate-90' : ''} />
		</a>

		<MembersCopy fields={data.fields} />
	</div>

	{#if $summary}
		<div transition:slide={{ duration: 150 }}>
			<MembersStats {data} />
		</div>
	{/if}

	<Members members={data.members} {columns} bind:selectedColumnsId />

	<div class="flex justify-end">
		<Pagination />
	</div>
</div>