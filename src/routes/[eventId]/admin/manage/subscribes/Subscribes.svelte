<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { Subscribe } from '@prisma/client'

	import ColumnsSelect, { type Column } from '$lib/ColumnsSelect.svelte'
	import { jsonParse } from '$lib/jsonParse'
	import { Placeholder } from '$lib/material'
	import { formatRange } from '$lib/formatRange'
	import WorkInProgress from '$lib/WorkInProgress.svelte'

	export let subscribes: PageData['subscribes']

	const defaultColumnsId = jsonParse<string[]>($page.url.searchParams.get('columns'), [])

	const columns: Record<string, Column<Subscribe>> = {}
	let selectedColumns: Column<Subscribe>[] = defaultColumnsId.map((id) => columns[id])
</script>

<WorkInProgress />

<div class="contents">
	<div class="relative z-10">
		<div class="absolute right-8">
			<ColumnsSelect {columns} {defaultColumnsId} bind:selectedColumns />
		</div>
	</div>

	<div class="overflow-x-auto overflow-y-scroll min-h-[320px] max-h-[600px]">
		{#if subscribes.length}
			<table class="table table-pin-rows">
				<thead>
					<tr>
						<th>Membre</th>
						<th>Secteur</th>
						<th>Période</th>
						{#each selectedColumns as column}
							<th>{column.label}</th>
						{/each}
						<th />
					</tr>
				</thead>

				<tbody>
					{#each subscribes as sub (sub.id)}
						<tr>
							<td>
								{sub.member.user.firstName}
								{sub.member.user.lastName}
							</td>
							<td>
								{sub.period.team.name}
							</td>
							<td>
								{formatRange(sub.period)}
							</td>

							{#each selectedColumns as column}
								{@const value = column.getValue(sub)}
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
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<Placeholder>Aucune inscription trouvé</Placeholder>
		{/if}
	</div>
</div>
