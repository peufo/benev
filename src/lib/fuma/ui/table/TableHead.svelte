<script lang="ts" generics="Item extends {id: string}">
	import { component, type ComponentAndProps } from '$lib/fuma/utils/component.js'
	import { type TableField, TableFieldsEdition } from '$lib/fuma/ui/table/index.js'
	import { tableHeadComponent } from '$lib/fuma/ui/table/head/index.js'
	import TableHeadDefault from '$lib/fuma/ui/table/head/TableHeadDefault.svelte'

	interface Props {
		fields: TableField<Item>[];
		key: string;
		onCreateField?: (() => void) | undefined;
	}

	let { fields, key, onCreateField = undefined }: Props = $props();

	function getComponent(field: TableField<Item>): ComponentAndProps {
		if (field.type === 'select' || field.type === 'multiselect')
			return tableHeadComponent(field.type, { options: field.options || [] })(field)
		if (field.type) return tableHeadComponent(field.type, {})(field)
		if (!field.head) return component(TableHeadDefault<Item>, { field })
		if (typeof field.head === 'function') return field.head(field)
		if (typeof field.head === 'string') return tableHeadComponent(field.head, {})(field)
		return field.head
	}
</script>

<thead>
	<tr class="shadow">
		{#each fields.filter((f) => f._visible) as field (field.key)}
			{@const { component, props } = getComponent(field)}
			{@const SvelteComponent = component}
			<SvelteComponent {...props} />
		{/each}
		<TableFieldsEdition {fields} {key} {onCreateField} />
	</tr>
</thead>
