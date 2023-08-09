<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'

	import { eventPath } from '$lib/store/index.js'
	import EditorJsHTML from 'editorjs-html'
	import type { Page } from '@prisma/client'
	import { Icon } from '$lib/material'

	export let page: Page | null
	export let isOwner = false

	const parser = EditorJsHTML()
	let blocksHTML: string[] = []

	$: {
		const content = page?.content ? JSON.parse(page?.content) : null
		blocksHTML = content ? parser.parse(content) : []
	}
</script>

<div class="card bg-base-100 mx-auto prose p-6">
	{#each blocksHTML as html}
		{@html html}
	{:else}
		{#if page?.isIndex}
			<h2>Salut 👋</h2>
			<p>
				Merci pour ta confiance.<br />
				Tu peux éditer cette page qui servira a accueillir tes bénévoles en cliquant sur le bouton juste
				en-dessous.
			</p>
		{:else}
			<div class="text-center p-10">
				Cette page est vide
			</div>
		{/if}
	{/each}

	{#if isOwner}
		<div class="flex justify-end not-prose">
			<a href="{$eventPath}/admin/pages{page ? `/${page.id}` : ''}" class="btn">
				<Icon path={mdiPencilOutline} />
				Editer cette page
			</a>
		</div>
	{/if}
</div>
