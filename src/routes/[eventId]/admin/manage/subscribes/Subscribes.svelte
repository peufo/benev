<script lang="ts">
	import { page } from '$app/stores'

	import ColumnsSelect, { type Column } from '$lib/ColumnsSelect.svelte'
	import { jsonParse } from '$lib/jsonParse'

	import { Placeholder } from '$lib/material'
	import { Subscribe } from '@prisma/client'

	export let subscribes: Subscribe[]

	const defaultColumnsId = jsonParse<string[]>($page.url.searchParams.get('columns'), [])

	const columns: Record<string, Column<Subscribe>> = {}
	let selectedColumns: Column<Subscribe>[] = defaultColumnsId.map((id) => columns[id])
</script>

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
						<th>Période</th>
						{#each selectedColumns as column}
							<th>{column.label}</th>
						{/each}
						<th />
					</tr>
				</thead>

				<tbody>
					{#each subscribes as subscribe (subscribe.id)}
						<tr>
							<td>
								{subscribe.periodId}
							</td>

							{#each selectedColumns as column}
								{@const value = column.getValue(subscribe)}
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
