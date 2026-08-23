<script lang="ts">
	import { page as currentPage } from '$app/state'
	import { JsonLd } from 'svelte-meta-tags'
	import Page from '$lib/pages/Page.svelte'
	import { eventPath } from '$lib/eventPath'
	import { breadcrumbSchema, SITE_NAME } from '$lib/seo'
	let { data } = $props()

	let origin = $derived(currentPage.url.origin)
	let breadcrumb = $derived(
		breadcrumbSchema([
			{ name: SITE_NAME, url: `${origin}/` },
			{ name: data.event.name, url: `${origin}/${data.event.id}` },
			{ name: data.page.title, url: `${origin}/${data.event.id}/${data.page.path}` },
		])
	)
</script>

{#if breadcrumb}
	<JsonLd schema={breadcrumb} />
{/if}

<Page page={data.page} member={data.member} />

{#if data.memberCanRegister}
	<div class="text-center my-8">
		<a href={eventPath('/register')} class="btn btn-primary"> Je veux devenir bénévole </a>
	</div>
{/if}
