<script lang="ts">
	import {
		mdiAccountCircleOutline,
		mdiAlertOutline,
		mdiCheckCircleOutline,
		mdiFilterRemoveOutline,
		mdiShieldAccountOutline,
		mdiSigma,
	} from '@mdi/js'
	import type { PageData } from './$types'
	import {
		Card,
		InputSearch,
		Pagination,
		Table,
		type TableField,
		TableViewSelect,
		urlParam,
		Icon,
		Drawer,
	} from 'fuma'
	import { component } from '$lib/utils'
	import { MemberCell } from '$lib/member'
	import SubscribesCopy from './SubscribesCopy.svelte'
	import SubscribesStats from './SubscribesStats.svelte'
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

<div class="flex gap-4 items-start">
	<Card class="min-w-0 grow" bodyClass="sm:px-2 sm:py-2">
		<div class="flex flex-col gap-2">
			<div class="flex gap-x-2 gap-y-2 flex-wrap">
				<InputSearch />
				<div class="grow" />

				<!-- SHOW MEMBERS STATS -->
				<a href={$urlParam.with({ subscribes_stats: 1 })} class="btn btn-square btn-sm xl:hidden">
					<Icon path={mdiSigma} title="Afficher le résumé des inscriptions" size={18} />
				</a>

				<!-- RESET FILTERS -->
				<a
					href={$urlParam.without(...fields.map((f) => f.key), 'skip', 'take')}
					class="btn btn-square btn-sm"
				>
					<Icon path={mdiFilterRemoveOutline} title="Effacer les filtres" size={18} />
				</a>
				<TableViewSelect key="subscribes" views={data.views} action="{$eventPath}/admin" />

				<SubscribesCopy />
			</div>

			<Table
				key="subscribes"
				{fields}
				items={data.subscribes}
				slotAction={(subscribe) => component(SubscribeMenu, { subscribe })}
				placholder="Aucune inscription trouvé"
			/>

			<div class="flex justify-end">
				<Pagination />
			</div>
		</div>
	</Card>

	<Card class="hidden xl:block" bodyClass="sm:px-2 sm:py-2">
		<SubscribesStats {data} />
	</Card>
</div>

<Drawer
	title="Résumé des inscriptions"
	key="subscribes_stats"
	class="xl:hidden"
	classBody="p-4 pb-10"
>
	<SubscribesStats {data} />
</Drawer>
