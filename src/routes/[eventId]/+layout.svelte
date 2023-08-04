<script lang="ts">
	import { page } from '$app/stores'
	import { mdiChevronRight } from '@mdi/js'

	import Header from '$lib/Header.svelte'
	import { Icon } from '$lib/material'

	export let data

	// TODO use event pages
	export let pages: [string, string][] = [
		['', 'Bienvenu'],
		['/teams', 'Équipes'],
		['/rules', 'Règlement'],
		['/faq', 'FAQ'],
	]

	$: eventId = $page.params.eventId

</script>

<div class="p-2">
	<Header userName={data.user?.name}>
		<a slot="start" href="/{eventId}" class="btn btn-ghost text-xl pl-0">
			<Icon path={mdiChevronRight} />
			{data.event.name}
		</a>

		<div slot="end" class="tabs">
			{#each pages as [pageId, label] (pageId)}
				<a
					class="tab tab-bordered"
					href="/{eventId}{pageId}"
					class:tab-active={$page.route.id === pageId}
				>
					{label}
				</a>
			{/each}
		</div>
	</Header>
</div>

<main class="grow p-2">
	<slot />
</main>
