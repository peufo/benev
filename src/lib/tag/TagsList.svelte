<script lang="ts">
	import type { Tag } from '@prisma/client'

	export let tags: Tag[]
	let klass = ''
	export { klass as class }
</script>

<div class="flex gap-1 {klass}">
	{#each tags as tag}
		<span
			class="badge badge-xs"
			style="
			font-size: 0.6rem;
			border-color: {tag.color};
			background-color: {tag.color}20;
		"
		>
			{tag.name}
		</span>
	{/each}
</div>
