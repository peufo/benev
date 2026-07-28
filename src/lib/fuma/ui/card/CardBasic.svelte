<script lang="ts">
	
	interface Props {
		title?: string;
		class?: string;
		style?: string;
		children?: import('svelte').Snippet;
	}

	let {
		title = '',
		class: klass = '',
		style = '',
		children
	}: Props = $props();
</script>

<div class="{klass} bg-base-100 border rounded-lg p-2 sm:p-5" {style}>
	{#if title}
		<h2 class="font-medium mb-2">
			{title}
		</h2>
	{/if}
	{@render children?.()}
</div>
