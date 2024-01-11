<script lang="ts">
	import { tip } from '$lib/action'

	import { type TableField, TableFieldsSelect } from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]
</script>

<thead>
	<tr class="shadow">
		{#each fields.filter((f) => f.locked || f.visible) as field (field.key)}
			<th use:tip={{ disable: !field.hint, content: field.hint }}>
				{field.label}
			</th>
		{/each}
		<TableFieldsSelect bind:fields />
	</tr>
</thead>
