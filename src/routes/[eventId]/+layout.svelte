<script lang="ts">
	import {
		mdiChevronRight,
		mdiEmailOutline,
		mdiMapMarkerOutline,
		mdiPhoneOutline,
		mdiWeb,
	} from '@mdi/js'

	import Header from '$lib/Header.svelte'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Footer from '$lib/Footer.svelte'
	import EventMenu from './EventMenu.svelte'

	export let data
</script>

<svelte:head>
	<title>{data.event.name}</title>
</svelte:head>

<Header userName={data.user?.firstName} pathPrefix={$eventPath}>
	<div class="contents" slot="start">
		<a href={$eventPath} class="text-lg hover:bg-base-200 h-12 px-2 flex items-center gap-2 rounded-lg">
			{#if data.event.logo}
				<img class="inline-block w-5 mx-1" src={data.event.logo} alt="logo of {data.event.name}">
			{/if}
			<span>
				{data.event.name}
			</span>
		</a>
	</div>
	<div slot="end" class="contents">
		<EventMenu
			pages={data.pages}
			pageIndex={data.pageIndex}
			isOwner={data.isOwner}
			isLeaderInEvent={data.isLeaderInEvent}
		/>
	</div>
</Header>

<main class="grow p-2">
	<slot />
</main>

<Footer>
	<div class="flex flex-wrap">
		{#if data.event.web}
			<a class="btn btn-sm sm:btn-md btn-ghost flex" href={data.event.web} target="_blank">
				{#if data.event.logo}
					<img class="inline-block w-5 mx-1" src={data.event.logo} alt="logo of {data.event.name}">
				{:else}
					<Icon path={mdiWeb} />
				{/if}
				{data.event.web.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, '')}
			</a>
		{/if}

		{#if data.event.email}
			<a class="btn btn-sm sm:btn-md btn-ghost flex" href="mailto:{data.event.email}" target="_blank">
				<Icon path={mdiEmailOutline} />
				{data.event.email}
			</a>
		{/if}

		{#if data.event.phone}
			<a class="btn btn-sm sm:btn-md btn-ghost flex" href="tel:{data.event.phone}" target="_blank">
				<Icon path={mdiPhoneOutline} />
				{data.event.phone}
			</a>
		{/if}

		{#if data.event.address}
			<a
				class="btn btn-sm sm:btn-md btn-ghost flex"
				href="https://www.google.com/maps/place/{data.event.address}"
				target="_blank"
			>
				<Icon path={mdiMapMarkerOutline} />
				{data.event.address}
			</a>
		{/if}
	</div>
</Footer>
