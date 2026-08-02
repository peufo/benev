<script lang="ts">
	interface Props {
		href: string
		title?: string
		class?: string
		children?: import('svelte').Snippet
	}

	let { href, title = '', class: klass = '', children }: Props = $props()
</script>

<div
	class="
		{klass} relative
    shadow hover:shadow-md transition-all
    bg-base-100 border border-hard rounded-lg p-2 sm:p-5
  "
>
	{#if title}
		<h2 class="font-medium mb-2">
			{title}
		</h2>
	{/if}
	{@render children?.()}
	<a {href} class="absolute inset-0" aria-hidden="true" tabindex="-1"></a>
</div>
