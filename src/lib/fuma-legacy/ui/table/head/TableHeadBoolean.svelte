<script lang="ts" generics="Item extends {id: string}">
	import { CheckIcon, XIcon } from '@lucide/svelte'
	import type { TableField } from '$lib/fuma-legacy/ui/table/index.js'
	import TableHeadSelect from '$lib/fuma-legacy/ui/table/head/TableHeadSelect.svelte'

	interface Props {
		field: TableField<Item>
	}

	let { field }: Props = $props()
</script>

<TableHeadSelect
	{field}
	options={[
		{ value: 'true', label: 'Oui', icon: CheckIcon },
		{ value: 'false', label: 'Non', icon: XIcon },
	]}
/>
