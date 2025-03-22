<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import type { Tag } from '@prisma/client'
	import { Icon, param } from 'fuma'

	export let tag: Tag
	export let is_editable = false
</script>

<div class="flex items-center">
	<div class="rounded-full w-3 h-3 -translate-x-1" style="background-color: {tag.color};" />
	<div>{tag.name}</div>
	{#if is_editable}
		<a
			href={$param.with({ form_tag: tag.id })}
			data-sveltekit-replacestate
			class="btn btn-xs btn-circle btn-ghost min-h-[18px] w-[18px] h-[18px] opacity-80 ml-1 -mr-1"
		>
			<Icon path={mdiPencilOutline} size={16} />
		</a>
	{/if}
</div>
