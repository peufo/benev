<script lang="ts">
	import { PAGE_TYPE } from '$lib/constant'
	import type { Page } from '@prisma/client'
	import { Icon } from '$lib/fuma-legacy'

	interface Props {
		page: Page
	}

	let { page }: Props = $props()
</script>

<div class="flex gap-2">
	<Icon path={PAGE_TYPE[page.type].icon} class="ml-auto" />
	<span>{page.title}</span>
</div>
