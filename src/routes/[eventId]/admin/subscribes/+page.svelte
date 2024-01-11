<script lang="ts">
	import { InputSearch, Pagination } from '$lib/material'
	import { Table, type TableField } from '$lib/material/table'
	import { component } from '$lib/utils'
	import { MemberCell } from '$lib/member'

	import type { PageData } from './$types'
	import Filters from './Filters.svelte'
	import SubscribesCopy from './SubscribesCopy.svelte'
	import {
		SubscribeCreatedBy,
		SubscribeIsAbsent,
		SubscribeMenu,
		SubscribeStateForm,
	} from '$lib/subscribe'
	import { formatRange } from '$lib/formatRange'

	export let data

	type Subscribe = PageData['subscribes'][number]

	const fields: TableField<Subscribe>[] = [
		{
			key: 'member',
			label: 'Membre',
			getCell: (sub) => component(MemberCell, { member: sub.member }),
			locked: true,
		},
		{
			key: 'team',
			label: 'Secteur',
			getCell: (sub) => sub.period.team.name,
			visible: true,
		},
		{
			key: 'period',
			label: 'Période',
			getCell: (sub) => formatRange(sub.period),
			visible: true,
		},
		{
			key: 'subscribeBy',
			label: 'Inscription',
			getCell: ({ createdBy }) => component(SubscribeCreatedBy, { createdBy }),
		},
		{
			key: 'isAbsent',
			label: 'Absent',
			getCell: ({ isAbsent }) => component(SubscribeIsAbsent, { isAbsent }),
		},
		{
			key: 'subscribeState',
			label: 'Statut',
			getCell: (subscribe) => component(SubscribeStateForm, { subscribe, isLeader: true }),
			visible: true,
		},
	]
</script>

<div class="flex flex-col gap-3">
	<div class="flex gap-x-2 gap-y-2 flex-wrap">
		<InputSearch />
		<Filters teams={data.teams} />
		<SubscribesCopy />
	</div>

	<Table
		{fields}
		items={data.subscribes}
		action={(subscribe) => component(SubscribeMenu, { subscribe })}
		placholder="Aucune inscription trouvé"
	/>

	<div class="flex justify-end">
		<Pagination />
	</div>
</div>
