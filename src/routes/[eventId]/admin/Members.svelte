<script lang="ts">
	import { getAge } from '$lib/utils'
	import { eventPath } from '$lib/store'

	import { Card, Icon, InputCheckboxsMenu, InputSearch, Placeholder } from '$lib/material'
	import Contact from '$lib/Contact.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { jsonParse } from '$lib/jsonParse'
	import type { PageData } from './$types'
	import { mdiViewColumnOutline } from '@mdi/js'
	import MembersCopy from './MembersCopy.svelte'

	type Member = PageData['members'][number]
	export let members: Member[]
	export let fields: PageData['fields']
	export let teams: PageData['teams']
	export let workTimes: Record<string, number> = {}

	const toHour = (ms: number) => ms / (1000 * 60 * 60)

	let selectedColumns: string[] = JSON.parse($page.url.searchParams.get('columns') || 'null') || [
		'periods',
		'hours',
		'sectors',
	]
	const columns: Record<
		string,
		{ label: string; cellValue: (m: Member) => string | number | boolean | string[] }
	> = {
		periods: { label: 'Périodes', cellValue: (m) => m.subscribes.length },
		hours: { label: 'Heures', cellValue: (m) => toHour(workTimes[m.id]) },
		sectors: { label: 'Secteurs à charges', cellValue: (m) => m.leaderOf.map(({ name }) => name) },
		age: { label: 'Age', cellValue: (m) => getAge(m.user.birthday) },
		...fields.reduce(
			(acc, cur) => ({
				...acc,
				[cur.id]: {
					label: cur.name,
					cellValue: (m: Member) => {
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

<Card class="md:col-span-2 overflow-x-auto" headerClass="flex-wrap">
	<div slot="title" class="flex gap-4 flex-wrap">
		<span>Membres</span>
		<InputSearch />
	</div>

	<div slot="action" class="flex gap-x-3 gap-y-2 flex-wrap">
		<MembersFilter {teams} {fields} />
		<MembersCopy {members} {fields} />
	</div>

	<div class="relative z-10">
		<div class="absolute right-8 top-4">
			<InputCheckboxsMenu
				key="columns"
				bind:value={selectedColumns}
				label="Colonnes"
				options={columns}
				right
				enhanceDisabled
				btnClass="btn-square"
			>
				<div slot="label" class="contents">
					<Icon
						path={mdiViewColumnOutline}
						title="Choix des colonnes"
						tippyProps={{ placement: 'left' }}
					/>
				</div>
			</InputCheckboxsMenu>
		</div>
	</div>

	<div class="overflow-x-auto overflow-y-scroll min-h-[320px] max-h-[600px] mt-2">
		{#if members.length}
			<table class="table table-pin-rows">
				<thead>
					<tr>
						<th>Nom</th>
						{#each selectedColumns as columnId}
							<th>{columns[columnId].label}</th>
						{/each}
						<th />
					</tr>
				</thead>

				<tbody>
					{#each members as member (member.id)}
						<tr
							on:click={() => goto(`${$eventPath}/admin/members/${member.id}`)}
							class="hover cursor-pointer"
						>
							<td>
								{member.user.firstName}
								{member.user.lastName}
							</td>

							{#each selectedColumns as columnId}
								{@const value = columns[columnId].cellValue(member)}
								<td>
									{#if Array.isArray(value)}
										{#each value as v}
											<span class="badge badge-sm mr-1 whitespace-nowrap">
												{v}
											</span>
										{/each}
									{:else if typeof value === 'number'}
										<span class="badge">{value}</span>
									{:else if typeof value === 'boolean'}
										<span class="badge">{value ? 'OUI' : 'NON'}</span>
									{:else}
										<span>{value}</span>
									{/if}
								</td>
							{/each}

							<td align="right">
								<Contact user={{ ...member.user }} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<Placeholder>Aucun bénévole actif</Placeholder>
		{/if}
	</div>
</Card>
