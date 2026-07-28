<script lang="ts">
	import Tree from './Tree.svelte';
	import { page } from '$app/stores'
	interface Props {
		tree: string[][];
		level?: number;
	}

	let { tree, level = 0 }: Props = $props();
</script>

<ul>
	{#each tree.filter((p) => p.length === level + 1) as path, index (path.join('/'))}
		{@const pathname = path.join('/')}
		{@const children = tree.filter((p, i) => i !== index && p.join('/').startsWith(pathname))}
		{@const isActive = $page.url.pathname.endsWith(pathname)}

		<li>
			<a href="/root/{pathname}" class:bg-primary={isActive} class:text-white={isActive}>
				{path.at(-1)}
			</a>

			{#if children.length}
				<Tree tree={children} level={level + 1} />
			{/if}
		</li>
	{/each}
</ul>
