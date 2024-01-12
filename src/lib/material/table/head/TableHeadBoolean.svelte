<script lang="ts">
	import { mdiCheck, mdiClose } from '@mdi/js'
	// import { Icon, type TableField } from '$lib/material'
	import type { TableField } from '$lib/material'

	export let field: TableField
</script>

<th>
	<span>{field.label}</span>
	<!--

		{#if value}
			<Icon path={mdiCheck} class="fill-success" />
		{:else}
			<Icon path={mdiClose} class="fill-error" />
		{/if}
	-->
</th>
