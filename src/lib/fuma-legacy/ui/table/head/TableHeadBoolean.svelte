<script lang="ts" generics="Item extends {id: string}">
	import { mdiCheck, mdiClose } from '@mdi/js'
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
		{ value: 'true', label: 'Oui', icon: mdiCheck },
		{ value: 'false', label: 'Non', icon: mdiClose },
	]}
/>
