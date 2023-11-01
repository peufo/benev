<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import {page as pageStore} from '$app/stores'

	import { eventPath } from '$lib/store/index.js'
	import EditorJsHTML from 'editorjs-html'
	import type { Page } from '@prisma/client'
	import { Icon } from '$lib/material'
	import HelpPage from '$lib/HelpPage.svelte'

	export let page: Page | null

	const parser = EditorJsHTML()
	let blocksHTML: string[] = []
	$: {
		const content = page?.content ? JSON.parse(page?.content) : null
		blocksHTML = content ? parser.parse(content) : []
	}

	$: canEdit = ['owner', 'admin'].includes($pageStore.data.member?.role || '')
	
</script>

<div class="card bg-base-100 mx-auto prose p-6 shadow-md">
	{#each blocksHTML as html}
		{@html html}
	{:else}
		{#if page?.isIndex}
			<HelpPage />
		{:else}
			<div class="text-center p-10">Cette page est vide</div>
		{/if}
	{/each}

	{#if canEdit}
		<div class="flex justify-end not-prose">
			<a href="{$eventPath}/admin/pages{page ? `/${page.id}` : ''}" class="btn btn-sm">
				<Icon path={mdiPencilOutline} />
				Editer cette page
			</a>
		</div>
	{/if}
</div>
