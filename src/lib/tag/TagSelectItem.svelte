<script lang="ts">
	import { PencilIcon } from '@lucide/svelte'
	import type { Tag } from '@prisma/client'
	import { tip } from 'fuma'
	import type { DrawerLinkAttributes } from '$lib/drawerCall.svelte'

	interface Props {
		tag: Tag
		/** Le lien du tiroir d'édition. Absent, l'étiquette se rend sans crayon. */
		edit?: DrawerLinkAttributes
	}

	let { tag, edit }: Props = $props()
</script>

<div class="flex items-center min-w-0">
	<div
		class="rounded-full w-3 h-3 -translate-x-1 shrink-0"
		style="background-color: {tag.color};"
	></div>
	<div class="truncate">{tag.name}</div>
	{#if edit}
		<a
			{...edit}
			class="btn btn-xs btn-circle btn-ghost min-h-4.5 w-4.5 h-4.5 shrink-0 opacity-80 ml-1 -mr-1"
			use:tip={{ content: "Modifier l'étiquette" }}
		>
			<PencilIcon size={16} />
		</a>
	{/if}
</div>
