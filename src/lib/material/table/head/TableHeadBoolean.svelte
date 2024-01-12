<script lang="ts">
	import { mdiCheck, mdiClose } from '@mdi/js'
	import type { TableField } from '$lib/material'
	import TableHeadSelect from './TableHeadSelect.svelte'

	export let field: TableField
</script>

<TableHeadSelect
	{field}
	options={[
		{ value: 'true', label: 'Oui', icon: mdiCheck },
		{ value: 'false', label: 'Non', icon: mdiClose },
	]}
/>
