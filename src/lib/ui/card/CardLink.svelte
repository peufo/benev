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
	class={[
		'relative',
		'shadow hover:shadow-md hover:border-hard transition-all',
		'bg-base-100 border border-soft rounded-lg p-2 sm:p-5',
		klass,
	]}
>
	{#if title}
		<h2 class="title-md">{title}</h2>
	{/if}
	{@render children?.()}
	<a {href} class="absolute inset-0" aria-hidden="true" tabindex="-1"></a>
</div>
