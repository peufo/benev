<script lang="ts">
	import { mdiDotsHorizontal } from '@mdi/js'
	import { Icon, DropDown } from '$lib/material'

	import type { TableField } from '$lib/material'
	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]
</script>

<th class="p-0 px-1 sticky right-0 z-10" align="right">
	<DropDown tippyProps={{ appendTo: () => document.body, placement: 'bottom-end' }}>
		<button slot="activator" type="button" class="btn btn-sm btn-square btn-ghost backdrop-blur">
			<Icon path={mdiDotsHorizontal} title="Choix des colonnes" />
		</button>

		<ul>
			{#each fields as field}
				<li class="menu-item font-normal">
					<span>{field.label}</span>
				</li>
			{/each}
		</ul>
	</DropDown>
</th>
