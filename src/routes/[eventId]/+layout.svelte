<script lang="ts">
	import {
		ArchiveIcon,
		ArrowLeftIcon,
		FlaskConicalIcon,
		GlobeIcon,
		MailIcon,
		MapPinnedIcon,
		PhoneIcon,
	} from '@lucide/svelte'
	import facebookLogo from '$lib/assets/facebook.svg'
	import instagramLogo from '$lib/assets/instagram.svg'
	import { page } from '$app/stores'
	import { JsonLd } from 'svelte-meta-tags'

	import { Card } from '$lib/ui'
	import { Drawer } from 'fuma'
	import { eventPath } from '$lib/store'
	import { Header, Footer, AdminNavigation } from '$lib/layout'
	import { MemberFieldForm } from '$lib/member'
	import DrawersForm from '$lib/DrawersForm.svelte'
	import { MediaDrawer } from '$lib/material/media'
	import EventMenu from './EventMenu.svelte'
	import FooterLink from './FooterLink.svelte'
	import EventTheme from '$lib/event/theme/EventTheme.svelte'
	import { EventIcon, EventTierBadge } from '$lib/event'
	import { mapUrl } from '$lib/location'
	import { eventSchema } from '$lib/seo'

	let { data, children } = $props()

	/** Sans une seule coordonnée, le premier étage du pied de page n'aurait rien à porter. */
	let hasEventContact = $derived(
		!!(
			data.event.web ||
			data.event.facebook ||
			data.event.instagram ||
			data.event.email ||
			data.event.phone ||
			data.event.location
		)
	)

	let accessGranted = $derived(
		data.event.state === 'published' || data.member?.roles.includes('leader') || data.userIsRoot
	)

	// Les metas de l'évènement sont publiées par le `load` et rendues par le layout racine
	let eventUrl = $derived(`${$page.url.origin}/${data.event.id}`)
	let eventImage = $derived(
		data.event.posterId ? `${$page.url.origin}/media/${data.event.posterId}?size=large` : undefined
	)
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

<!-- Dégradé de page. `secondary` et non `accent`: l'orange est le repère temporel du plan,
     qui vit précisément dans ces pages — un lavis orange le noierait. -->
<div
	class="absolute inset-0 bg-linear-to-b from-secondary/15 via-secondary/6 to-transparent -z-10"
></div>

<Header user={data.user}>
	{#snippet start()}
		<a
			href="{$eventPath}/me"
			class="
				text-lg hover:bg-base-200 h-10 px-2 flex items-center gap-2 rounded-lg
				whitespace-nowrap overflow-hidden text-ellipsis min-w-0
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
			<span class="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
				{data.event.name}
			</span>
		</a>
	{/snippet}

	{#snippet end()}
		{#if accessGranted}
			<EventMenu pages={data.pages} />
		{/if}
	{/snippet}
</Header>

<div class="flex grow items-start relative max-w-full">
	{#if data.member?.roles.includes('leader') || data.userIsRoot}
		<div class="hidden md:flex flex-col gap-2 sticky top-1 ml-1 shrink-0">
			<AdminNavigation>
				<EventTierBadge event={data.event} membersValided={data.membersValided} />
			</AdminNavigation>
		</div>
	{/if}

	<main class="grow mx-auto overflow-x-clip self-stretch px-1 min-w-0">
		{#if accessGranted}
			{@render children?.()}
		{:else if data.event.state === 'draft'}
			<Card class="max-w-lg mx-auto">
				{#snippet title()}
					<h2 class="flex gap-2">
						<FlaskConicalIcon class="rotate-12 opacity-70" />

						<span>Bientôt disponible</span>
					</h2>
				{/snippet}

				<p class="mt-4">
					L'espace bénévole de l'évènement <b>{data.event.name}</b> est cours d'élaboration.
				</p>

				<div class="mt-8">
					<a href="/me" class="btn btn-sm">
						<ArrowLeftIcon />
						<span>mon profil</span>
					</a>
				</div>
			</Card>
		{:else}
			<Card class="max-w-lg mx-auto">
				{#snippet title()}
					<h2 class="flex gap-2">
						<ArchiveIcon class="opacity-70" />
						<span>Cet évènement est archivé</span>
					</h2>
				{/snippet}

				<div class="mt-8">
					<a href="/me" class="btn btn-sm">
						<ArrowLeftIcon />
						<span>mon profil</span>
					</a>
				</div>
			</Card>
		{/if}
	</main>
</div>

<Footer variant={hasEventContact ? 'event' : 'app'}>
	<!-- Marge négative égale au padding de `btn` : les liens s'alignent optiquement
	     sur le logo de la bande benevio, en dessous. -->
	<div class="-ml-3 flex flex-wrap items-center sm:-ml-4">
		<FooterLink link={data.event.web}>
			{#snippet logo()}
				{#if data.event.icon}
					<EventIcon icon={data.event.icon} class="inline-block w-5 mx-1" />
				{:else}
					<GlobeIcon />
				{/if}
			{/snippet}
		</FooterLink>

		<FooterLink link={data.event.facebook}>
			{#snippet logo()}
				<img src={facebookLogo} alt="" width="20" height="20" aria-hidden="true" />
			{/snippet}
			{#snippet children({ label })}
				{label.replace(/^facebook.com\//, '')}
			{/snippet}
		</FooterLink>
		<FooterLink link={data.event.instagram}>
			{#snippet logo()}
				<img src={instagramLogo} alt="" width="20" height="20" aria-hidden="true" />
			{/snippet}
			{#snippet children({ label })}
				{label.replace(/^instagram.com\//, '')}
			{/snippet}
		</FooterLink>

		<FooterLink link={data.event.email} protocol="mailto:" icon={MailIcon} />
		<FooterLink link={data.event.phone} protocol="tel:" icon={PhoneIcon} />

		{#if data.event.location}
			<FooterLink link={mapUrl(data.event.location)} icon={MapPinnedIcon}>
				{data.event.location.label}
			</FooterLink>
		{/if}
	</div>
</Footer>

<!-- TODO: WHY THIS IS NOT IN /[eventId]/admin ???? -->
{#if data.member?.roles.includes('leader')}
	<DrawersForm event={data.event} team={data.team} period={data.period || {}} tag={data.tag} />

	<Drawer
		key="form_field"
		title="{data.field?.id ? 'Modifier le' : 'Nouveau'} champ"
		class="surface-drawer"
		maxWidth="28rem"
	>
		{#snippet children({ close })}
			<MemberFieldForm field={data.field || {}} onsuccess={() => close()} />
		{/snippet}
	</Drawer>

	<!-- Une seule médiathèque pour toute l'application: les `InputMedia` et l'éditeur riche
	     l'ouvrent par `mediaDrawer.open()`. -->
	<MediaDrawer />
{/if}
