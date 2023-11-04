<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import { page as pageStore } from '$app/stores'

	import { eventPath } from '$lib/store/index.js'
	import EditorJsHTML from 'editorjs-html'
	import type { Page } from '@prisma/client'
	import { Icon } from '$lib/material'

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

<PageLayout>
	{#each blocksHTML as html}
		{@html html}
	{:else}
		<slot name="placeholder">
			<div class="text-center p-10">Cette page est vide</div>
		</slot>
	{/each}

	{#if canEdit}
		<div class="flex justify-end not-prose">
			<a href="{$eventPath}/admin/pages{page ? `/${page.id}` : ''}" class="btn btn-sm">
				<Icon path={mdiPencilOutline} />
				Editer cette page
			</a>
		</div>
	{/if}
</PageLayout>
