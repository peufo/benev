<script lang="ts">
	import { page } from '$app/state'
	import { Card } from '$lib/ui'
	import { TERMS_VERSION } from '$lib/constant'
	import dayjs from '$lib/dayjs'
	import { LEGAL_DOCS } from './legal'

	interface Props {
		title: string
		children: import('svelte').Snippet
	}

	let { title, children }: Props = $props()

	const effectiveDate = dayjs(TERMS_VERSION).format('D MMMM YYYY')
	const others = $derived(LEGAL_DOCS.filter((doc) => doc.path !== page.url.pathname))
</script>

<Card class="mx-auto max-w-2xl">
	<div class="prose max-w-none">
		<h1>{title}</h1>
		<p>Date d'effet : <b>{effectiveDate}</b></p>

		{@render children()}
	</div>

	<nav class="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-t border-soft pt-5 text-sm">
		{#each others as doc (doc.path)}
			<a href={doc.path} class="link link-hover">{doc.label}</a>
		{/each}
	</nav>
</Card>
