<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet
	}

	let { children }: Props = $props()
</script>

<div class="max-w-none grow bg-white">
	{@render children?.()}
</div>
