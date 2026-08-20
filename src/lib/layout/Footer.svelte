<script lang="ts">
	import benevio from '$lib/assets/benevio.svg'
	import { LEGAL_DOCS } from './legal'

	interface Props {
		class?: string
		children?: import('svelte').Snippet
	}

	let { class: klass = '', children }: Props = $props()
</script>

<footer
	class={[
		'footer footer-center border-t border-hard',
		'p-6 bg-base-100 gap-5 overflow-hidden mt-1',
		klass,
	]}
>
	{@render children?.()}

	<nav class="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
		<a href="/open-source" class="link link-hover">Open source</a>
		<a href="/contact" class="link link-hover">Contact</a>
		{#each LEGAL_DOCS as doc (doc.path)}
			<a href={doc.path} class="link link-hover">{doc.label}</a>
		{/each}
	</nav>

	<div class="text-left">
		<a href="/" class="btn btn-sm btn-outline ml-auto border-soft">
			<img src={benevio} alt="logo de benev.io" class="h-5" />
		</a>
		<span class="text-xs opacity-60">
			©2023-{new Date().getFullYear()} Dev Voisard - Switzerland
		</span>
	</div>
</footer>

<style>
	:global(:has(.footer-hidden) footer) {
		display: none;
	}
</style>
