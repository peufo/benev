<script lang="ts" generics="Item extends {id: string}">
	import type { TableField } from '$lib/fuma/ui/table/index.js'
	import { tip } from '$lib/fuma/action/tip.js'

	interface Props {
		field: TableField<Item>;
	}

	let { field }: Props = $props();
</script>

<th use:tip={{ disable: !field.hint, content: field.hint }}>
	{field.label}
</th>
