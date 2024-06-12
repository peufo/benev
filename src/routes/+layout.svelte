<script lang="ts">
	import { Toaster } from 'svelte-sonner'
	import { MetaTags, JsonLd } from 'svelte-meta-tags'
	import { theme } from './[eventId]/admin/theme/store'
	import logo from '$lib/assets/logo.png'
	import { periodDrawerTransitionX } from '$lib/store'
	import '../app.css'
</script>

<svelte:head>
	<meta name="author" content="Jonas Voisard" />
</svelte:head>

<MetaTags
	title="Benev.io"
	description="Ta plateforme de gestion de bénévoles"
	openGraph={{
		title: 'Benev.io',
		description: 'Ta plateforme de gestion de bénévoles',
		images: [
			{
				url: logo,
				width: 500,
				height: 500,
				alt: 'Logo de Benev.io',
			},
		],
	}}
/>

<JsonLd
	schema={{
		'@type': 'Organization',
		name: 'Benev',
		logo,
		url: 'https://benev.io',
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
