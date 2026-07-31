<script lang="ts">
	import { PAGE_TYPE } from '$lib/constant'
	import type { Page } from '@prisma/client'

	interface Props {
		page: Page
	}

	let { page }: Props = $props()
	const PageIcon = $derived(PAGE_TYPE[page.type].icon)
</script>

<div class="flex gap-2">
	<PageIcon class="ml-auto" />
	<span>{page.title}</span>
</div>
