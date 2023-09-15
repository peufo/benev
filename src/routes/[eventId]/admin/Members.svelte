<script lang="ts">
	import { getAge } from '$lib/utils'
	import { eventPath } from '$lib/store'

	import { Card, InputCheckboxsMenu, InputSearch, Placeholder } from '$lib/material'
	import Contact from '$lib/Contact.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { jsonParse } from '$lib/jsonParse'
	import type { PageData } from './$types'

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
	<div slot="title" class="flex gap-2 flex-wrap">
		<span>Membres</span>
		<InputSearch />
		<InputCheckboxsMenu
			key="columns"
			bind:value={selectedColumns}
			label="Choix des colonnes"
			labelPlurial="Colonnes"
			options={columns}
			right
			enhanceDisabled
		/>
	</div>

	<div slot="action" class="flex gap-2 flex-wrap">
		<MembersFilter {teams} />
	</div>

	<div class="overflow-x-auto min-h-[270px]">
		{#if members.length}
			<table class="table table-pin-rows">
				<thead>
					<tr>
						<th>Nom</th>
						{#each selectedColumns as columnId}
							<th>{columns[columnId].label}</th>
						{/each}
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
