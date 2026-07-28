<script lang="ts">
	import { page } from '$app/stores'
	import { JsonLd } from 'svelte-meta-tags'
	import {
		mdiArchiveOutline,
		mdiArrowLeft,
		mdiEmailOutline,
		mdiFacebook,
		mdiInstagram,
		mdiMapMarkerOutline,
		mdiPhoneOutline,
		mdiTestTube,
		mdiWeb,
	} from '@mdi/js'

	import { Card, Drawer, Icon } from 'fuma'
	import { eventPath } from '$lib/store'
	import { Header, Footer, AdminNavigation } from '$lib/layout'
	import { MemberFieldForm } from '$lib/member'
	import DrawersForm from '$lib/DrawersForm.svelte'
	import EventMenu from './EventMenu.svelte'
	import FooterLink from './FooterLink.svelte'
	import EventTheme from './admin/theme/EventTheme.svelte'
	import { EventIcon, EventTierBadge } from '$lib/event'
	import { mapUrl } from '$lib/location'
	import { eventSchema } from '$lib/seo'

	export let data

	$: accessGranted =
		data.event.state === 'published' || data.member?.roles.includes('leader') || data.userIsRoot

	// Les metas de l'évènement sont publiées par le `load` et rendues par le layout racine
	$: eventUrl = `${$page.url.origin}/${data.event.id}`
	$: eventImage = data.event.posterId
		? `${$page.url.origin}/media/${data.event.posterId}?size=large`
		: undefined
</script>

<JsonLd
	schema={eventSchema({
		name: data.event.name,
		url: eventUrl,
		description: data.event.description,
		image: eventImage,
		startDate: data.event.startDate,
		endDate: data.event.endDate,
		location: data.event.location,
		web: data.event.web,
	})}
/>

<EventTheme event={data.event} />

<Header user={data.user}>
	<a
		slot="start"
		href="{$eventPath}/me"
		class="
			text-lg hover:bg-base-200 h-12 px-2 flex items-center gap-2 rounded-lg
			whitespace-nowrap overflow-hidden overflow-ellipsis min-w-0
		"
	>
		{#if data.event.logoId}
			<img
				class="inline-block h-10 mx-1"
				src="/media/{data.event.logoId}?size=medium"
				alt="logo of {data.event.name}"
			/>
		{:else if data.event.icon}
			<EventIcon icon={data.event.icon} class="inline-block w-5 mx-1" />
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

<div class="flex grow items-start relative max-w-full">
	{#if data.member?.roles.includes('leader') || data.userIsRoot}
		<div class="hidden lg:flex flex-col gap-2 sticky top-4 mt-4 ml-4 shrink-0">
			<AdminNavigation />
			<EventTierBadge event={data.event} membersValided={data.membersValided} />
		</div>
	{/if}

	<main class="grow mx-auto overflow-x-clip self-stretch p-2 sm:p-4 min-w-0">
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
</div>

<Footer>
	<div class="flex flex-wrap justify-center">
		<FooterLink link={data.event.web}>
			<svelte:fragment slot="icon">
				{#if data.event.icon}
					<EventIcon icon={data.event.icon} class="inline-block w-5 mx-1" />
				{:else}
					<Icon path={mdiWeb} />
				{/if}
			</svelte:fragment>
		</FooterLink>

		<FooterLink link={data.event.facebook} icon={mdiFacebook} let:label>
			{label.replace(/^facebook.com\//, '')}
		</FooterLink>
		<FooterLink link={data.event.instagram} icon={mdiInstagram} let:label>
			{label.replace(/^instagram.com\//, '')}
		</FooterLink>

		<FooterLink link={data.event.email} protocol="mailto:" icon={mdiEmailOutline} />
		<FooterLink link={data.event.phone} protocol="tel:" icon={mdiPhoneOutline} />

		{#if data.event.location}
			<FooterLink link={mapUrl(data.event.location)} icon={mdiMapMarkerOutline}>
				{data.event.location.label}
			</FooterLink>
		{/if}
	</div>
</Footer>

<!-- TODO: WHY THIS IS NOT IN /[eventId]/admin ???? -->
{#if data.member?.roles.includes('leader')}
	<DrawersForm event={data.event} team={data.team} period={data.period || {}} tag={data.tag} />

	<Drawer key="form_field" title="{data.field?.id ? 'Modifier le' : 'Nouveau'} champ" let:close>
		<MemberFieldForm field={data.field || {}} on:success={() => close()} />
	</Drawer>
{/if}
