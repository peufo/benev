<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import { page as pageStore } from '$app/stores'

	import { eventPath } from '$lib/store/index.js'
	import EditorJsHTML from 'editorjs-html'
	import type { Page } from '@prisma/client'
	import { CopyLink, Icon } from '$lib/material'

	import PageLayout from './PageLayout.svelte'

	export let page: Page | null

	const parser = EditorJsHTML()
	let blocksHTML: string[] = []
	$: {
		const content = page?.content ? JSON.parse(page?.content) : null
		blocksHTML = content ? parser.parse(content) : []
	}

	$: canEdit = $pageStore.data.member?.roles.includes('admin')
</script>

<PageLayout class="relative max-w-2xl">
	{#each blocksHTML as html}
		{@html html}
	{:else}
		<slot name="placeholder">
			<div class="text-center p-10">Cette page est vide</div>
		</slot>
	{/each}

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
