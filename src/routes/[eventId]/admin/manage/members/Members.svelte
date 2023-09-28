<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'

	import { getAge } from '$lib/utils'
	import { eventPath } from '$lib/store'
	import { Placeholder } from '$lib/material'
	import Contact from '$lib/Contact.svelte'
	import { jsonParse } from '$lib/jsonParse'

	import type { PageData } from './$types'
	import ColumnsSelect, { type Column } from '$lib/ColumnsSelect.svelte'

	type Member = PageData['members'][number]
	export let members: Member[]
	export let fields: PageData['fields']
	export let workTimes: Record<string, number> = {}

	const toHour = (ms: number) => ms / (1000 * 60 * 60)

	const defaultColumnsId = jsonParse<string[]>($page.url.searchParams.get('columns'), [
		'periods',
		'hours',
		'sectors',
	])

	const columns: Record<string, Column<Member>> = {
		periods: { label: 'Périodes', getValue: (m) => m.subscribes.length },
		hours: { label: 'Heures', getValue: (m) => toHour(workTimes[m.id]) },
		sectors: { label: 'Secteurs à charges', getValue: (m) => m.leaderOf.map(({ name }) => name) },
		age: { label: 'Age', getValue: (m) => getAge(m.user.birthday) },
		...fields.reduce(
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
	let selectedColumns: Column<Member>[] = defaultColumnsId.map((id) => columns[id])
</script>

<div class="contents">
	<div class="relative z-10">
		<div class="absolute right-8">
			<ColumnsSelect {columns} {defaultColumnsId} bind:selectedColumns />
		</div>
	</div>

	<div class="overflow-x-auto overflow-y-scroll min-h-[320px] max-h-[600px]">
		{#if members.length}
			<table class="table table-pin-rows">
				<thead>
					<tr>
						<th>Nom</th>
						{#each selectedColumns as column}
							<th>{column.label}</th>
						{/each}
						<th />
					</tr>
				</thead>

				<tbody>
					{#each members as member (member.id)}
						<tr
							on:click={() => goto(`${$eventPath}/admin/manage/members/${member.id}`)}
							class="hover cursor-pointer"
						>
							<td>
								{member.user.firstName}
								{member.user.lastName}
							</td>

							{#each selectedColumns as column}
								{@const value = column.getValue(member)}
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
			<Placeholder>Aucun membre trouvé</Placeholder>
		{/if}
	</div>
</div>
