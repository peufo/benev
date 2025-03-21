<script lang="ts">
	import type { Tag } from '@prisma/client'

	export let tags: Tag[]
</script>

<div class="flex gap-1">
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
