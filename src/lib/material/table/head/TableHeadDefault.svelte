<script lang="ts">
	import type { TableField } from 'fuma'
	import { tip } from '$lib/action'

	export let field: TableField
</script>

<th use:tip={{ disable: !field.hint, content: field.hint }}>
	{field.label}
</th>
