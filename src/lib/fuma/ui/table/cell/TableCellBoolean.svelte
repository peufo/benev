<script lang="ts">
	import { mdiCheck, mdiClose } from '@mdi/js'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	interface Props {
		value: boolean;
	}

	let { value }: Props = $props();
</script>

<td>
	{#if value}
		<Icon path={mdiCheck} class="fill-success" />
	{:else}
		<Icon path={mdiClose} class="fill-error" />
	{/if}
</td>
