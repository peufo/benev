<script lang="ts">
	import Tree from './Tree.svelte'
	interface Props {
		children?: import('svelte').Snippet
	}

	let { children }: Props = $props()

	let tree = Object.keys(import.meta.glob('./**/+page.svelte'))
		.map((p) => p.replace('./', '').replace(/\/?\+page.svelte/, ''))
		.filter(Boolean)
		.map((link) => link.split('/'))
		.filter((slugs) => !slugs.find((slug) => slug.startsWith('[')))
</script>

<div class="flex gap-4">
	<div class="menu p-4 min-h-full w-min">
		<h1 class="text-lg">HEY ROOT 👋</h1>
		<hr class="my-2" />
		<Tree {tree} />
	</div>
	<div class="grow min-w-0">
		{@render children?.()}
	</div>
</div>
