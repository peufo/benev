<script lang="ts">
	import { PencilIcon } from '@lucide/svelte'
	import type { Tag } from '@prisma/client'
	import { param } from 'fuma'

	interface Props {
		tag: Tag
		is_editable?: boolean
	}

	let { tag, is_editable = false }: Props = $props()
</script>

<div class="flex items-center">
	<div class="rounded-full w-3 h-3 -translate-x-1" style="background-color: {tag.color};"></div>
	<div>{tag.name}</div>
	{#if is_editable}
		<a
			href={param.with({ form_tag: tag.id })}
			data-sveltekit-replacestate
			class="btn btn-xs btn-circle btn-ghost min-h-4.5 w-4.5 h-4.5 opacity-80 ml-1 -mr-1"
		>
			<PencilIcon size={16} />
		</a>
	{/if}
</div>
