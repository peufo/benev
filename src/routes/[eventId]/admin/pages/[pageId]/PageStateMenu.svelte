<script lang="ts">
	import type { Page, PageState } from '@prisma/client'
	import type { ClassValue } from 'svelte/elements'
	import { PAGE_STATES } from '$lib/constant'
	import { StateMenu } from '$lib/ui'
	import { setPageState } from './page.remote'

	interface Props {
		page: Pick<Page, 'id' | 'state'>
		class?: ClassValue
	}

	let { page, class: klass }: Props = $props()

	const transitions: Record<PageState, { state: PageState; label: string }[]> = {
		draft: [{ state: 'published', label: 'Publier' }],
		published: [{ state: 'draft', label: 'Repasser en brouillon' }],
	}
</script>

<StateMenu
	states={PAGE_STATES}
	state={page.state}
	transitions={transitions[page.state]}
	form={setPageState}
	id={page.id}
	class={klass}
/>
