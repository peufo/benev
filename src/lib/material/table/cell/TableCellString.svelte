<script lang="ts">
	import type { TableField } from '$lib/material/table'

	export let value: string
	export let field: TableField
</script>

<td data-field-key={field.key} data-field-type={field.type === 'textarea' ? 'textarea' : 'string'}>
	<span>{@html value}</span>
</td>
