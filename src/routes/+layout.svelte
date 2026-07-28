<script lang="ts">
	import { page } from '$app/stores'
	import { Toaster } from 'svelte-sonner'
	import { MetaTags, JsonLd } from 'svelte-meta-tags'
	import { theme } from './[eventId]/admin/theme/store'
	import { periodDrawerTransitionX } from '$lib/store'
	import {
		defaultMetaTags,
		errorMetaTags,
		mergeMetaTags,
		organizationSchema,
		websiteSchema,
	} from '$lib/seo'
	import '../app.css'
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let siteUrl = $derived($page.url.origin)

	/**
	 * Unique point de rendu des metas du site : `MetaTags` écrit dans `<svelte:head>` sans
	 * dédoublonner, donc deux instances empilées produiraient des balises en double.
	 * Chaque `load` publie ses surcharges via `metaTags` dans ses données.
	 */
	let metaTags = $derived(mergeMetaTags(
		defaultMetaTags($page.url),
		$page.error ? errorMetaTags($page.status) : $page.data.metaTags
	))
</script>

<svelte:head>
	<meta name="author" content="Jonas Voisard" />
</svelte:head>

<MetaTags {...metaTags} />

<JsonLd schema={organizationSchema(siteUrl)} />
<JsonLd schema={websiteSchema(siteUrl)} />

<Toaster />

<div
	class="flex min-h-screen flex-col bg-base-200/20"
	style="
		--card-opacity: {$theme.cardOpacity ?? 1};
		padding-right: {$periodDrawerTransitionX}px;
	"
>
	{@render children?.()}
</div>
