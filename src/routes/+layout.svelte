<script lang="ts">
	import { page } from '$app/stores'
	import { Toaster } from 'svelte-sonner'
	import { MetaTags, JsonLd } from 'svelte-meta-tags'
	import TermsAcceptDialog from '$lib/me/TermsAcceptDialog.svelte'
	import { transitionX } from 'fuma'
	import {
		defaultMetaTags,
		errorMetaTags,
		mergeMetaTags,
		organizationSchema,
		websiteSchema,
	} from '$lib/seo'
	import '../app.css'

	let { data, children } = $props()

	let siteUrl = $derived($page.url.origin)

	/**
	 * Unique point de rendu des metas du site : `MetaTags` écrit dans `<svelte:head>` sans
	 * dédoublonner, donc deux instances empilées produiraient des balises en double.
	 * Chaque `load` publie ses surcharges via `metaTags` dans ses données.
	 */
	let metaTags = $derived(
		mergeMetaTags(
			defaultMetaTags($page.url),
			$page.error ? errorMetaTags($page.status) : $page.data.metaTags
		)
	)
</script>

<svelte:head>
	<meta name="author" content="Jonas Voisard" />
</svelte:head>

<MetaTags {...metaTags} />

<JsonLd schema={organizationSchema(siteUrl)} />
<JsonLd schema={websiteSchema(siteUrl)} />

<Toaster richColors />

<!-- On doit forcer un padding supplémentaire de 6 à cause de la marge des drawers -->
<div
	class={['flex min-h-screen flex-col bg-base-200/20']}
	style="padding-right: {transitionX.current + (transitionX.current ? 6 : 0)}px;"
>
	{@render children?.()}
</div>

<TermsAcceptDialog user={data.user} />
