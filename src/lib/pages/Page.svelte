<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import { page as pageStore } from '$app/stores'

	import { eventPath } from '$lib/store/index.js'

	import type { Page } from '@prisma/client'
	import { CopyLink, Icon } from '$lib/material'
	import { tiptap } from '$lib/pages/tiptap'

	import type { MemberWithComputedValues } from '$lib/server'
	import PageLayout from './PageLayout.svelte'
	import { getMemberReplacers } from './memberSuggestions'
	import { injectValues} from './injectValues'

	export let page: Page | null
	export let member: MemberWithComputedValues | undefined = undefined
	
	$: html = transformPage(tiptap.toHTML(page?.content || ''))
	$: canEdit = $pageStore.data.member?.roles.includes('admin')

	function transformPage(_html: string) {
		if (page?.type !== 'member' || !member) return _html
		const replacers = getMemberReplacers({member})
		return injectValues(_html, replacers)
	}

</script>

<PageLayout class="relative max-w-2xl py-16">
	{#if html && html !== '<p></p>'}
		{@html html}
	{:else}
		<slot name="placeholder">
			<div class="text-center p-10">Cette page est vide</div>
		</slot>
	{/if}

	<div class="flex justify-end gap-2 not-prose absolute right-5 top-5">
		{#if canEdit}
			<a
				href="{$eventPath}/admin/pages{page ? `/${page.id}` : ''}"
				class="btn btn-sm btn-square btn-ghost"
			>
				<Icon path={mdiPencilOutline} title="Éditer cette page" size={22} />
			</a>
		{/if}
		<CopyLink path="{$eventPath}{page ? `/${page.path}` : ''}" />
	</div>
</PageLayout>
