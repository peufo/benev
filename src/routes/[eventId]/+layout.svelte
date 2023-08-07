<script lang="ts">
	import { page } from '$app/stores'
	import { mdiChevronRight, mdiPencilOutline } from '@mdi/js'

	import Header from '$lib/Header.svelte'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'

	export let data

	// TODO use event pages
	export let pages: [string, string][] = [
		['', 'Bienvenu'],
		['/teams', 'Équipe'],
		['/rules', 'Règlement'],
		['/faq', 'FAQ'],
	]
</script>

<div class="p-2">
	<Header userName={data.user?.name}>
		<div class="content" slot="start">
			<a href={$eventPath} class="btn btn-ghost text-xl pl-0">
				<Icon path={mdiChevronRight} />
				{data.event.name}
			</a>

			{#if data.isOwner}
				<a href="{$eventPath}/edit" class="btn btn-ghost btn-square" title="Éditer l'évenement">
					<Icon path={mdiPencilOutline} title="Éditer l'évenement" />
				</a>
			{/if}
		</div>

		<div slot="end" class="tabs">
			{#each pages as [pageId, label] (pageId)}
				<a
					class="tab tab-bordered"
					href="{$eventPath}{pageId}"
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
