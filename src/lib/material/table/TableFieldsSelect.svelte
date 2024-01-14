<script lang="ts">
	import { goto } from '$app/navigation'

	import { urlParam } from '$lib/store'
	import { listEditable } from '$lib/action'
	import { mdiCheck, mdiCircleSmall, mdiDotsHorizontal, mdiDrag } from '@mdi/js'
	import { Icon, DropDown, type TableField } from '$lib/material'
	import { context } from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]
	export let fieldsVisible: string[]
	export let key: string

	const { KEY_FIELDS_VISIBLE } = context.get(key)

	function onFieldClick(key: string) {
		const index = fieldsVisible.indexOf(key)
		if (index === -1) fieldsVisible.push(key)
		else fieldsVisible.splice(index, 1)

		const newUrl = fieldsVisible.length
			? $urlParam.with({ [KEY_FIELDS_VISIBLE]: JSON.stringify(fieldsVisible) })
			: $urlParam.without(KEY_FIELDS_VISIBLE)
		goto(newUrl, {
			replaceState: true,
			noScroll: true,
			keepFocus: true,
			invalidateAll: false,
		})
	}

	function handleReorder(_fields: TableField<Item>[]) {
		fields = _fields
	}
</script>

<th class="p-0 px-1 sticky right-0 z-10" align="right">
	<DropDown
		hideOnNav={false}
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
			{#each fields as field (field.key)}
				<div
					class="menu-item w-full"
					class:disabled={field.locked}
					role="menuitem"
					tabindex="0"
					on:click={() => onFieldClick(field.key)}
					on:keydown={(e) => e.key === 'Espace' && onFieldClick(field.key)}
				>
					{#if field.locked}
						<Icon path={mdiCheck} class="fill-base-content/50" size={21} />
					{:else if fieldsVisible.includes(field.key)}
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
