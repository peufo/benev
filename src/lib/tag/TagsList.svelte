<script lang="ts">
	import type { Tag } from '@prisma/client'

	interface Props {
		tags: Tag[];
		class?: string;
	}

	let { tags, class: klass = '' }: Props = $props();
	
</script>

<div class="flex gap-1 {klass}">
	{#each tags as tag (tag.id)}
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
