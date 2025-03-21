<script lang="ts">
	import type { Tag } from '@prisma/client'

	export let tag: Tag
</script>

<div class="flex items-center">
	<div class="rounded-full w-3 h-3 -translate-x-1" style="background-color: {tag.color};" />
	<div>{tag.name}</div>
</div>
