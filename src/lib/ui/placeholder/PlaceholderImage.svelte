<script lang="ts">
	let {
		children,
	}: {
		children?: import('svelte').Snippet
	} = $props()
</script>

<div class="p-2">
	<div
		class={[
			'grid h-full w-full content-center justify-items-center p-2',
			'gap-1 border-2 border-dotted border-hard bg-base-100',
		]}
	>
		<span class="text-center text-sm font-medium text-base-content/60">
			{#if children}{@render children()}{:else}Pas d'image{/if}
		</span>
	</div>
</div>
