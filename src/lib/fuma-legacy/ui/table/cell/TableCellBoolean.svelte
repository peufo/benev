<script lang="ts">
	import { CheckIcon, XIcon } from '@lucide/svelte'
	interface Props {
		value: boolean
	}

	let { value }: Props = $props()
</script>

<td>
	{#if value}
		<CheckIcon class="text-success" />
	{:else}
		<XIcon class="text-error" />
	{/if}
</td>
