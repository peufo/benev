<script lang="ts" generics="Item extends {id: string}">
	import type { TableField } from '$lib/fuma-legacy/ui/table/index.js'

	interface Props {
		value: string
		field: TableField<Item>
	}

	let { value, field }: Props = $props()
</script>

<td data-field-key={field.key} data-field-type={field.type === 'textarea' ? 'textarea' : 'string'}>
	<span>{@html value}</span>
</td>
