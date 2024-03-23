<script lang="ts">
	import {
		mdiAccountCircleOutline,
		mdiAlertOutline,
		mdiCheckCircleOutline,
		mdiShieldAccountOutline,
	} from '@mdi/js'
	import type { PageData } from './$types'
	import { Card, InputSearch, Pagination } from '$lib/material'
	import { Table,  type TableField, TableViewSelect } from '$lib/material/table'
	import { component } from '$lib/utils'
	import { MemberCell } from '$lib/member'
	import SubscribesCopy from './SubscribesCopy.svelte'
	import {
		SubscribeCreatedBy,
		SubscribeIsAbsent,
		SubscribeMenu,
		SubscribeStateForm,
	} from '$lib/subscribe'
	import { formatRange } from '$lib/formatRange'

	import { eventPath } from '$lib/store'
	import { SUBSCRIBE_STATE } from '$lib/constant'

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
			type: 'multiselect',
			options: data.teams.map((t) => ({ value: t.id, label: t.name })),
			getCell: (sub) => `
				<a href="${$eventPath}/teams/${sub.period.teamId}" class="link link-hover">
					${sub.period.team.name}
				</a>
			`,
			visible: true,
		},
		{
			key: 'period',
			label: 'Période',
			type: 'date',
			getCell: (sub) => `
				<a href="${$eventPath}/teams/${sub.period.teamId}/${sub.periodId}" class="link link-hover">
					${formatRange(sub.period)}
				</a>
			`,
			visible: true,
		},
		{
			key: 'createdBy',
			label: 'Inscription',
			type: 'select',
			options: {
				leader: { label: 'Inscrit par un responsable', icon: mdiShieldAccountOutline },
				user: { label: 'Inscrit par le membre', icon: mdiAccountCircleOutline },
			},
			getCell: ({ createdBy }) => component(SubscribeCreatedBy, { createdBy }),
		},
		{
			key: 'isAbsent',
			label: 'Absent',
			type: 'select',
			options: {
				true: { label: 'Marqué comme absent', icon: mdiAlertOutline },
				false: { label: 'Marqué comme présent', icon: mdiCheckCircleOutline },
			},
			getCell: ({ isAbsent }) => component(SubscribeIsAbsent, { isAbsent }),
		},
		{
			key: 'states',
			label: 'Statut',
			type: 'multiselect',
			options: SUBSCRIBE_STATE,
			getCell: (subscribe) => component(SubscribeStateForm, { subscribe, isLeader: true }),
			visible: true,
		},
	]
</script>

<Card> 
	<h2 slot="title">Inscriptions</h2>

	<div class="flex flex-col gap-2">
		<div class="flex gap-x-2 gap-y-2 flex-wrap">
			<InputSearch />
			<div class="grow" />
			<TableViewSelect key="subscribes" views={data.views} />
			<SubscribesCopy />
		</div>
	
		<Table
			key="subscribes"
			{fields}
			items={data.subscribes}
			action={(subscribe) => component(SubscribeMenu, { subscribe })}
			placholder="Aucune inscription trouvé"
		/>
	
		<div class="flex justify-end">
			<Pagination />
		</div>
	</div>
</Card>
