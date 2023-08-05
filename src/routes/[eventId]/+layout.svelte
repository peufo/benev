<script lang="ts">
	import { page } from '$app/stores'
	import { mdiChevronRight, mdiCogOutline } from '@mdi/js'

	import Header from '$lib/Header.svelte'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'

	export let data

	// TODO use event pages
	export let pages: [string, string][] = [
		['', 'Bienvenu'],
		['/admin', 'Admin'],
		['/rules', 'Règlement'],
		['/faq', 'FAQ'],
	]

</script>

<div class="p-2">
	<Header userName={data.user?.name}>
		<a slot="start" href={$eventPath} class="btn btn-ghost text-xl pl-0">
			<Icon path={mdiChevronRight} />
			{data.event.name}
		</a>



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

			{#if data.isOwner}
				<a href="{$eventPath}/admin" class="btn btn-ghost btn-square">
					<Icon path={mdiCogOutline} title="Administration de l'évenement"/>
				</a>
			{/if}

		</div>
	</Header>
</div>

<main class="grow p-2">
	<slot />
</main>
