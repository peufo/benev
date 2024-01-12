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
	import TableHeadSelect from '$lib/material/table/head/TableHeadSelect.svelte'
	import {
		mdiAccountCircleOutline,
		mdiAlertOutline,
		mdiCheckCircleOutline,
		mdiShieldAccountOutline,
	} from '@mdi/js'
	import { eventPath } from '$lib/store'
	import { SUBSCRIBE_STATE } from '$lib/constant'
	import TableCell from '$lib/material/table/TableCell.svelte'

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
			key: 'teams',
			label: 'Secteur',
			visible: true,
			getCell: (sub) => `
				<a href="${$eventPath}/teams/${sub.period.teamId}" class="link link-hover">
					${sub.period.team.name}
				</a>
			`,
			head: (field) =>
				component(TableHeadSelect, {
					field,
					multiSelect: true,
					options: data.teams.map((t) => ({ value: t.id, label: t.name })),
				}),
		},
		{
			key: 'period',
			label: 'Période',
			visible: true,
			getCell: (sub) => `
				<a href="${$eventPath}/teams/${sub.period.teamId}/${sub.periodId}" class="link link-hover">
					${formatRange(sub.period)}
				</a>
			`,
		},
		{
			key: 'createdBy',
			label: 'Inscription',
			getCell: ({ createdBy }) => component(SubscribeCreatedBy, { createdBy }),
			head: (field) =>
				component(TableHeadSelect, {
					field,
					options: {
						leader: { label: 'Inscrit par un responsable', icon: mdiShieldAccountOutline },
						user: { label: 'Inscrit par le membre', icon: mdiAccountCircleOutline },
					},
				}),
		},
		{
			key: 'isAbsent',
			label: 'Absent',
			visible: true,
			getCell: ({ isAbsent }) => component(SubscribeIsAbsent, { isAbsent }),
			head: (field) =>
				component(TableHeadSelect, {
					field,
					options: {
						true: { label: 'Marqué comme absent', icon: mdiAlertOutline },
						false: { label: 'Marqué comme présent', icon: mdiCheckCircleOutline },
					},
				}),
		},
		{
			key: 'states',
			label: 'Statut',
			visible: true,
			getCell: (subscribe) => component(SubscribeStateForm, { subscribe, isLeader: true }),
			head: (field) =>
				component(TableHeadSelect, {
					field,
					multiSelect: true,
					options: SUBSCRIBE_STATE,
				}),
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
