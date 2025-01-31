<script lang="ts">
	import { PAGE_TYPE } from '$lib/constant'
	import type { Page } from '@prisma/client'
	import { Icon } from 'fuma'

	export let page: Page
</script>

<div class="flex gap-2">
	<Icon path={PAGE_TYPE[page.type].icon} class="ml-auto" />
	<span>{page.title}</span>
</div>
