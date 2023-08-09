<script lang="ts">
	import { page } from '$app/stores'
	import {
		mdiChevronRight,
		mdiCogOutline,
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
	import Menu from './Menu.svelte'

	export let data

</script>

<svelte:head>
	<title>BENEV - {data.event.name}</title>
</svelte:head>

<div class="p-2">
	<Header userName={data.user?.name}>
		<div class="contents" slot="start">
			<a href={$eventPath} class="link link-hover text-lg">
				<Icon path={mdiChevronRight} class="hidden lg:inline-block" />
				{data.event.name}
			</a>

			{#if data.isOwner}
				<a
					href="{$eventPath}/edit"
					class="
						hidden lg:btn btn-square 
						{$page.route.id?.startsWith(`/[eventId]/edit`) ? '' : 'lg:btn-ghost'}
					"
				>
					<Icon path={mdiCogOutline} title="Gestion évenement" class="rotate-12" />
				</a>
			{/if}
		</div>

		<div slot="end" class="contents">
			<Menu pages={data.pages} pageIndex={data.pageIndex} isOwner={data.isOwner} />
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
