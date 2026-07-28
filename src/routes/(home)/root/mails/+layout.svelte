<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet
	}

	let { children }: Props = $props()
</script>

<div class="prose max-w-none grow bg-white">
	{@render children?.()}
</div>
