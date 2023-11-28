<script lang="ts">
	import {
		mdiArchiveOutline,
		mdiArrowLeft,
		mdiEmailOutline,
		mdiMapMarkerOutline,
		mdiPhoneOutline,
		mdiTestTube,
		mdiWeb,
	} from '@mdi/js'

	import Header from '$lib/Header.svelte'
	import { Card, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import Footer from '$lib/Footer.svelte'
	import EventMenu from './EventMenu.svelte'
	import Poster from './Poster.svelte'

	export let data

	$: accessGranted =
		data.event.state === 'active' || data.member?.roles.includes('leader') || data.userIsRoot
</script>

<svelte:head>
	<title>{data.event.name}</title>
</svelte:head>

<Poster posterId={data.event.posterId} />

<Header user={data.user} class="">
	<a
		slot="start"
		href={$eventPath}
		class="
				text-lg hover:bg-base-200 h-12 px-2 flex items-center gap-2 rounded-lg
				whitespace-nowrap overflow-hidden overflow-ellipsis min-w-0
			"
	>
		{#if data.event.icon}
			<img class="inline-block w-5 mx-1" src={data.event.icon} alt="logo of {data.event.name}" />
		{/if}
		<span class="whitespace-nowrap overflow-hidden overflow-ellipsis min-w-0">
			{data.event.name}
		</span>
	</a>

	<svelte:fragment slot="end">
		{#if accessGranted}
			<EventMenu pages={data.pages} />
		{/if}
	</svelte:fragment>
</Header>

<main class="grow p-2">
	{#if accessGranted}
		<slot />
	{:else if data.event.state === 'draft'}
		<Card class="max-w-lg mx-auto">
			<h2 slot="title" class="flex gap-2">
				<Icon path={mdiTestTube} class="rotate-12 opacity-70" />

				<span>Bientôt disponible</span>
			</h2>

			<p class="mt-4">
				L'espace bénévole de l'évènement <b>{data.event.name}</b> est cours d'élaboration.
			</p>

			<div class="mt-8">
				<a href="/me" class="btn btn-sm">
					<Icon path={mdiArrowLeft} />
					<span>mon profil</span>
				</a>
			</div>
		</Card>
	{:else}
		<Card class="max-w-lg mx-auto">
			<h2 slot="title" class="flex gap-2">
				<Icon path={mdiArchiveOutline} class="opacity-70" />
				<span>Cet évènement est archivé</span>
			</h2>

			<div class="mt-8">
				<a href="/me" class="btn btn-sm">
					<Icon path={mdiArrowLeft} />
					<span>mon profil</span>
				</a>
			</div>
		</Card>
	{/if}
</main>

<Footer class="z-10">
	<div class="flex flex-wrap justify-center">
		{#if data.event.web}
			<a class="btn btn-sm sm:btn-md btn-ghost flex" href={data.event.web} target="_blank">
				{#if data.event.icon}
					<img
						class="inline-block w-5 mx-1"
						src={data.event.icon}
						alt="logo of {data.event.name}"
					/>
				{:else}
					<Icon path={mdiWeb} />
				{/if}
				{data.event.web.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, '')}
			</a>
		{/if}

		{#if data.event.email}
			<a
				class="btn btn-sm sm:btn-md btn-ghost flex"
				href="mailto:{data.event.email}"
				target="_blank"
			>
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
