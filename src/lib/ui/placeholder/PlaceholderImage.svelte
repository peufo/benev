<script lang="ts">
	import { PlusIcon } from '@lucide/svelte'

	interface Props {
		x: number
		y: number
		children?: import('svelte').Snippet
	}

	let { x, y, children }: Props = $props()
</script>

<div style:width="{x}px" style:height="{y}px" class="rounded-lg bg-base-200 p-2">
	<div class="grid h-full w-full content-center rounded-md border-4 border-dashed">
		<span class="text-center text-sm font-medium text-base-content/60">
			{#if children}{@render children()}{:else}Pas d'image{/if}
		</span>
		<PlusIcon size={30} class="text-base-content/60" />
	</div>
</div>
