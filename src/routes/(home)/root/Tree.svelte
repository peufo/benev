<script lang="ts">
	import Tree from './Tree.svelte'
	import { page } from '$app/stores'
	import type { ResolvedPathname } from '$app/types'
	interface Props {
		tree: string[][]
		level?: number
	}

	let { tree, level = 0 }: Props = $props()
</script>

<ul>
	{#each tree.filter((p) => p.length === level + 1) as path, index (path.join('/'))}
		{@const pathname = path.join('/')}
		{@const children = tree.filter((p, i) => i !== index && p.join('/').startsWith(pathname))}
		{@const isActive = $page.url.pathname.endsWith(pathname)}

		<li>
			<!-- L'arbre est bâti à l'exécution: `resolve()` ne prend qu'une route connue à la compilation. -->
			<a
				href={`/root/${pathname}` as ResolvedPathname}
				class:bg-primary={isActive}
				class:text-white={isActive}
			>
				{path.at(-1)}
			</a>

			{#if children.length}
				<Tree tree={children} level={level + 1} />
			{/if}
		</li>
	{/each}
</ul>
