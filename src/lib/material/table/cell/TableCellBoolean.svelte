<script lang="ts">
	import { mdiCheck, mdiClose } from '@mdi/js'
	import { Icon } from '$lib/material'
	export let value: boolean
</script>

<td>
	{#if value}
		<Icon path={mdiCheck} class="fill-success" />
	{:else}
		<Icon path={mdiClose} class="fill-error" />
	{/if}
</td>
