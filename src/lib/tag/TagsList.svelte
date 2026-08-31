<script lang="ts">
	import type { Tag } from '@prisma/client'

	interface Props {
		tags: Tag[]
		class?: string
	}

	let { tags, class: klass = '' }: Props = $props()
</script>

<div class="flex gap-1 min-w-0 {klass}">
	{#each tags as tag (tag.id)}
		<!-- `min-w-0` autorise l'étiquette à passer sous sa largeur de contenu: sans lui, un nom
		long déborderait de la carte au lieu de se laisser tronquer. -->
		<span
			class="badge badge-xs min-w-0"
			title={tag.name}
			style="
			font-size: 0.6rem;
			border-color: {tag.color};
			background-color: {tag.color}30;
		"
		>
			<span class="truncate">{tag.name}</span>
		</span>
	{/each}
</div>
