<script lang="ts">
	import Tree from './Tree.svelte'

	let tree = Object.keys(import.meta.glob('./**/+page.svelte'))
		.map((p) => p.replace('./', '').replace(/\/?\+page.svelte/, ''))
		.filter(Boolean)
		.map((link) => link.split('/'))
</script>

<div class="flex gap-4">
	<div class="menu p-4 min-h-full w-min">
		<h1 class="text-lg">HEY ROOT 👋</h1>
		<hr class="my-2" />
		<Tree {tree} />
	</div>
	<div class="grow">
		<slot />
	</div>
</div>
