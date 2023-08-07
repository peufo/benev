<script lang="ts">
	import { page } from '$app/stores'
	import {
		mdiChevronRight,
		mdiEmailOutline,
		mdiMapMarkerOutline,
		mdiPencilOutline,
		mdiPhone,
		mdiPhoneOutline,
		mdiWeb,
	} from '@mdi/js'

	import Header from '$lib/Header.svelte'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Footer from '$lib/Footer.svelte'

	export let data
</script>

<svelte:head>
	<title>BENEV - {data.event.name}</title>
</svelte:head>

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

		<div slot="end" class="tabs tabs-boxed">
			{#each data.pages as { title, path, id, isIndex } (id)}
				<a
					class="tab"
					href="{$eventPath}{isIndex ? '' : `/${path}`}"
					class:tab-active={(isIndex && !$page.params.pagePath) || $page.params.pagePath === path}
				>
					{title}
				</a>
			{/each}
		</div>
	</Header>
</div>

<main class="grow p-2">
	<slot />
</main>

<Footer>
	<div class="flex flex-wrap">
		{#if data.event.web}
			<a class="btn btn-ghost flex" href={data.event.web} target="_blank">
				<Icon path={mdiWeb} />
				{data.event.web.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, '')}
			</a>
		{/if}

		{#if data.event.email}
			<a class="btn btn-ghost flex" href="mailto:{data.event.email}" target="_blank">
				<Icon path={mdiEmailOutline} />
				{data.event.email}
			</a>
		{/if}

		{#if data.event.phone}
			<a class="btn btn-ghost flex" href="tel:{data.event.phone}" target="_blank">
				<Icon path={mdiPhoneOutline} />
				{data.event.phone}
			</a>
		{/if}

		{#if data.event.address}
			<a
				class="btn btn-ghost flex"
				href="https://www.google.com/maps/place/{data.event.address}"
				target="_blank"
			>
				<Icon path={mdiMapMarkerOutline} />
				{data.event.address}
			</a>
		{/if}
	</div>
</Footer>
