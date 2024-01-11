<script lang="ts">
	import { listEditable } from '$lib/action'

	import { mdiCheck, mdiCircleSmall, mdiDotsHorizontal, mdiDrag } from '@mdi/js'
	import { Icon, DropDown } from '$lib/material'

	import type { TableField } from '$lib/material'
	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]

	function onFieldClick(index: number) {
		fields = fields.map((field, i) => {
			if (i !== index) return field
			return {
				...field,
				visible: !field.visible,
			}
		})
	}

	function handleReorder(_fields: TableField<Item>[]) {
		fields = _fields
	}
</script>

<th class="p-0 px-1 sticky right-0 z-10" align="right">
	<DropDown
		class="max-h-screen"
		tippyProps={{ appendTo: () => document.body, placement: 'bottom-end' }}
	>
		<button slot="activator" type="button" class="btn btn-sm btn-square btn-ghost backdrop-blur">
			<Icon path={mdiDotsHorizontal} title="Choix des colonnes" />
		</button>

		<div
			use:listEditable={{
				dragElementsSelector: '.drag-button',
				items: fields,
				onChange: handleReorder,
			}}
		>
			{#each fields as field, index (field.key)}
				<div
					class="menu-item w-full"
					class:disabled={field.locked}
					role="menuitem"
					tabindex="0"
					on:click={() => onFieldClick(index)}
					on:keydown={(e) => e.key === 'Espace' && onFieldClick(index)}
				>
					{#if field.locked}
						<Icon path={mdiCheck} class="fill-base-content/50" size={21} />
					{:else if field.visible}
						<Icon path={mdiCheck} class="fill-success" size={21} />
					{:else}
						<Icon path={mdiCircleSmall} class="fill-base-content/50" size={21} />
					{/if}
					<span>{field.label}</span>
					<span class="drag-button btn btn-xs btn-square btn-ghost ml-auto">
						<Icon path={mdiDrag} size={18} class="fill-base-content/80" />
					</span>
				</div>
			{/each}
		</div>
	</DropDown>
</th>
