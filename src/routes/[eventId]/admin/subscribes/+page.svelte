<script lang="ts">
	import {
		CircleCheckIcon,
		CircleUserIcon,
		FilterXIcon,
		ShieldUserIcon,
		SigmaIcon,
		TriangleAlertIcon,
	} from '@lucide/svelte'
	import type { PageData } from './$types'
	import { Card, InputSearch } from '$lib/ui'
	import TableViewSelect from '$lib/view/TableViewSelect.svelte'
	import { Drawer, tip } from 'fuma'
	import { Pagination } from 'fuma'
	import { Table, type TableField } from 'fuma'
	import { urlParam } from 'fuma'
	import { MemberCell } from '$lib/member'
	import SubscribesImport from './SubscribesImport.svelte'
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
	import { TagsList } from '$lib/tag'
	import dayjs from '$lib/dayjs'

	let { data } = $props()

	type Subscribe = PageData['subscribes'][number]

	// `$derived.by` avec une annotation interne: passer le littéral à `$derived(...)` lui
	// ferait perdre son type contextuel, et les `options` des colonnes se mélangeraient.
	const fields: TableField<Subscribe>[] = $derived.by(() => {
		const columns: TableField<Subscribe>[] = [
			{
				key: 'member',
				label: 'Membre',
				cell: () => memberCell,
				locked: true,
			},
			{
				key: 'createdAt',
				label: 'Inscription',
				cell: (sub) => sub.createdAt.toLocaleDateString(),
				visible: false,
				type: 'date',
			},
			{
				key: 'teams',
				label: 'Secteur',
				type: 'multiselect',
				options: data.teams.map((t) => ({ value: t.id, label: t.name })),
				cell: () => teamCell,
				visible: true,
			},
			{
				key: 'tags',
				label: 'Étiquettes',
				type: 'multiselect',
				options: data.tags.map((t) => ({ value: t.id, label: t.name })),
				cell: () => tagsCell,
			},
			{
				key: 'period',
				label: 'Période',
				type: 'date',
				cell: () => periodCell,
				visible: true,
			},
			{
				key: 'createdBy',
				label: 'Inscrit par',
				type: 'select',
				options: {
					leader: { label: 'Inscrit par un responsable', icon: ShieldUserIcon },
					user: { label: 'Inscrit par le membre', icon: CircleUserIcon },
				},
				cell: () => createdByCell,
			},
			{
				key: 'isAbsent',
				label: 'Absent',
				type: 'select',
				options: {
					true: { label: 'Marqué comme absent', icon: TriangleAlertIcon },
					false: { label: 'Marqué comme présent', icon: CircleCheckIcon },
				},
				cell: () => isAbsentCell,
			},
			{
				key: 'isValidedByEvent',
				label: 'Membre approuvé',
				type: 'boolean',
				cell: (sub) => sub.member.isValidedByEvent,
				hint: "Un responsable à confirmé l'inscription du membre",
			},
			{
				key: 'isValidedByUser',
				label: 'Membre actif',
				type: 'boolean',
				cell: (sub) => sub.member.isValidedByUser,
				hint: `Le membre à confirmé sa participation à l'évenement`,
			},
			{
				key: 'states',
				label: 'Statut',
				type: 'multiselect',
				options: SUBSCRIBE_STATE,
				cell: () => stateCell,
				visible: true,
			},
		]
		return columns
	})
</script>

{#snippet memberCell(subscribe: Subscribe)}
	<MemberCell member={subscribe.member} />
{/snippet}

{#snippet teamCell(subscribe: Subscribe)}
	<a href="{$eventPath}/teams?section={subscribe.period.teamId}" class="link link-hover">
		{subscribe.period.team.name}
	</a>
{/snippet}

{#snippet tagsCell(subscribe: Subscribe)}
	<TagsList tags={subscribe.period.tags} />
{/snippet}

{#snippet periodCell(subscribe: Subscribe)}
	{@const duration = dayjs(subscribe.period.end).diff(subscribe.period.start, 'minutes')}
	<a
		href="{$eventPath}/teams?section={subscribe.period.teamId}&form_period={subscribe.periodId}"
		class="link link-hover whitespace-nowrap"
	>
		{formatRange(subscribe.period)}
		<span class="badge badge-sm">{duration} min.</span>
	</a>
{/snippet}

{#snippet createdByCell(subscribe: Subscribe)}
	<SubscribeCreatedBy createdBy={subscribe.createdBy} />
{/snippet}

{#snippet isAbsentCell(subscribe: Subscribe)}
	<SubscribeIsAbsent isAbsent={subscribe.isAbsent} />
{/snippet}

{#snippet stateCell(subscribe: Subscribe)}
	<SubscribeStateForm {subscribe} isLeader />
{/snippet}

<div class="flex gap-4 items-start">
	<Card class="min-w-0 grow" bodyClass="sm:px-2 sm:py-2">
		<div class="flex flex-col gap-2">
			<div class="flex gap-x-2 gap-y-2 flex-wrap">
				<InputSearch />
				<div class="grow"></div>

				<!-- SHOW MEMBERS STATS -->
				<a href={urlParam.with({ subscribes_stats: 1 })} class="btn btn-square btn-sm xl:hidden">
					<span class="inline-flex" use:tip={{ content: 'Afficher le résumé des inscriptions' }}
						><SigmaIcon size={18} /></span
					>
				</a>

				<!-- RESET FILTERS -->
				<a
					href={urlParam.without(...fields.map((f) => f.key), 'skip', 'take')}
					class="btn btn-square btn-sm"
				>
					<span class="inline-flex" use:tip={{ content: 'Effacer les filtres' }}
						><FilterXIcon size={18} /></span
					>
				</a>
				<TableViewSelect key="subscribes" views={data.views} ignoredKeys={['subscribes_stats']} />
				<SubscribesImport />
			</div>

			<Table
				key="subscribes"
				{fields}
				items={data.subscribes}
				placholder="Aucune inscription trouvé"
				class="border-hard"
			>
				{#snippet actions(subscribe)}
					<SubscribeMenu {subscribe} />
				{/snippet}
			</Table>

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
	class="surface-drawer xl:hidden"
	classBody="p-4 pb-10"
>
	<SubscribesStats {data} />
</Drawer>
