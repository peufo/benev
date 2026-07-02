<script lang="ts">
	import { page } from '$app/stores'
	import { Toaster } from 'svelte-sonner'
	import { MetaTags, JsonLd } from 'svelte-meta-tags'
	import { theme } from './[eventId]/admin/theme/store'
	import { periodDrawerTransitionX } from '$lib/store'
	import '../app.css'

	$: siteUrl = $page.url.origin
	$: pageUrl = $page.url.href
	$: ogImage = `${siteUrl}/logo.png`
</script>

<svelte:head>
	<meta name="author" content="Jonas Voisard" />
</svelte:head>

<MetaTags
	title="benevio"
	titleTemplate="%s | Plateforme de gestion de bénévoles"
	description="Gère simplement tes bénévoles avec benevio : inscriptions, planification, suivi et communication regroupés dans un outil gratuit pour les petits événements, open source et sans engagement."
	canonical={pageUrl}
	openGraph={{
		type: 'website',
		url: pageUrl,
		locale: 'fr_FR',
		siteName: 'benevio',
		title: 'benevio | Plateforme de gestion de bénévoles',
		description:
			'Gère simplement tes bénévoles avec benevio : inscriptions, planification, suivi et communication regroupés dans un outil gratuit pour les petits événements, open source et sans engagement.',
		images: [
			{
				url: ogImage,
				width: 500,
				height: 500,
				alt: 'Logo de benevio',
			},
		],
	}}
	twitter={{
		cardType: 'summary_large_image',
		title: 'benevio | Plateforme de gestion de bénévoles',
		description:
			'Gère simplement tes bénévoles avec benevio : inscriptions, planification, suivi et communication.',
		image: ogImage,
		imageAlt: 'Logo de benevio',
	}}
/>

<JsonLd
	schema={{
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'benevio',
		url: siteUrl,
		logo: ogImage,
	}}
/>

<JsonLd
	schema={{
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'benevio',
		url: siteUrl,
	}}
/>

<Toaster />

<div
	class="flex min-h-screen flex-col bg-base-200/20"
	style="
		--card-opacity: {$theme.cardOpacity ?? 1};
		padding-right: {$periodDrawerTransitionX}px;
	"
>
	<slot />
</div>
