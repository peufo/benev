<script lang="ts">
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

	const defaultColumnsId = ['periods', 'hours', 'sectors']
	export let selectedColumnsId = defaultColumnsId

	let limit = 50
	const step = 50
</script>

<div class="contents">
	<div class="relative z-10">
		<div class="absolute right-8">
			<ColumnsSelect {columns} {defaultColumnsId} bind:selectedColumnsId />
		</div>
	</div>

	<div class="table-wrapper">
		{#if members.length}
			<table class="table table-pin-rows">
				<thead>
					<tr class="shadow">
						<th class="sticky left-0 bg-base-100">Nom</th>
						{#each selectedColumnsId as colId}
							<th>{columns[colId].label}</th>
						{/each}
						<th />
					</tr>
				</thead>

				<tbody>
					{#each members.slice(0, limit) as member (member.id)}
						<tr
							on:click={() => goto(`${$eventPath}/admin/manage/members/${member.id}`)}
							class="hover cursor-pointer group"
						>
							<td class="sticky left-0 bg-base-100 group-hover:bg-base-200 border-r">
								{member.user.firstName}
								{member.user.lastName}
							</td>

							{#each selectedColumnsId as colId}
								{@const value = columns[colId].getValue(member)}
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
			{#if limit < members.length}
				<div class="w-full grid place-content-center sticky left-0 p-6">
					<button class="btn btn-sm" on:click={() => (limit += step)}>Afficher plus</button>
				</div>
			{/if}
		{:else}
			<Placeholder>Aucun membre trouvé</Placeholder>
		{/if}
	</div>
</div>
