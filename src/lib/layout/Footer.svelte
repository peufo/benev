<script lang="ts">
	import { resolve } from '$app/paths'
	import type { Snippet } from 'svelte'
	import benevio from '$lib/assets/benevio.svg'
	import { LEGAL_DOCS, LEGAL_ENTITY } from './legal'

	interface Props {
		/**
		 * `public` porte la marque et les chemins du site. `app` se réduit à l'ancre légale
		 * pour ne pas disputer l'attention à la tâche en cours. `event` laisse l'évènement
		 * parler au premier étage, la plateforme signant discrètement au second.
		 */
		variant?: 'public' | 'app' | 'event'
		class?: string
		/** Les coordonnées de l'évènement, rendues au premier étage de la variante `event`. */
		children?: Snippet
	}

	let { variant = 'public', class: klass = '', children }: Props = $props()

	const PRODUCT_LINKS = [
		{ path: resolve('/events'), label: 'Évènements' },
		{ path: resolve('/#pricing'), label: 'Tarifs' },
		{ path: resolve('/open-source'), label: 'Open source' },
		{ path: resolve('/contact'), label: 'Contact' },
	]

	const year = new Date().getFullYear()
</script>

{#snippet brandmark(size: string)}
	<a
		href={resolve('/')}
		class="inline-flex rounded-field outline-primary focus-visible:outline-2 focus-visible:outline-offset-2"
	>
		<img src={benevio} alt="benevio, accueil" class={size} />
	</a>
{/snippet}

{#snippet legalLinks(linkClass: string)}
	{#each LEGAL_DOCS as doc (doc.path)}
		<a href={doc.path} class={linkClass}>{doc.label}</a>
	{/each}
{/snippet}

{#snippet copyright(extraClass = '')}
	<span class={['text-sm text-base-content/70', extraClass]}>
		©2023-{year}
		{LEGAL_ENTITY.name} — {LEGAL_ENTITY.country}
	</span>
{/snippet}

<!-- La bande plateforme : identique dans `app` et au second étage de `event`. Elle se distingue
     par le filet et l'échelle, jamais par un second fond — sous un thème d'évènement, `base-100`
     et `base-200` deviennent tous deux translucides et cesseraient de se différencier. -->
{#snippet platformStrip()}
	<div class="flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
		{@render brandmark('h-5')}

		<nav class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/70">
			{@render legalLinks('link link-hover hover:text-base-content transition-colors')}
		</nav>

		{@render copyright('md:ml-auto')}
	</div>
{/snippet}

<footer class={['footer-shell surface m-1 mt-3 px-4 py-0 sm:px-6', klass]}>
	{#if variant === 'public'}
		<div class="mx-auto w-full max-w-6xl">
			<div
				class={[
					'grid grid-cols-2 gap-x-8 gap-y-10 py-10',
					'md:grid-cols-[minmax(0,24rem)_1fr_1fr] md:gap-x-16 md:py-12',
				]}
			>
				<div class="col-span-2 md:col-span-1">
					{@render brandmark('h-7')}

					<p class="mt-4 max-w-xs text-base-content/70">
						Tes bénévoles choisissent leurs créneaux. Tu gardes la vue d'ensemble.
					</p>
				</div>

				<nav aria-labelledby="footer-produit" class="flex flex-col items-start gap-2 text-sm">
					<p id="footer-produit" class="font-bold text-base-content/70">Produit</p>
					{#each PRODUCT_LINKS as link (link.path)}
						<a
							href={link.path}
							class="link link-hover text-base-content/70 hover:text-base-content transition-colors"
						>
							{link.label}
						</a>
					{/each}
				</nav>

				<nav aria-labelledby="footer-legal" class="flex flex-col items-start gap-2 text-sm">
					<p id="footer-legal" class="font-bold text-base-content/70">Légal</p>
					{@render legalLinks(
						'link link-hover text-base-content/70 hover:text-base-content transition-colors'
					)}
				</nav>
			</div>

			<div class="border-t border-soft py-4">
				{@render copyright()}
			</div>
		</div>
	{:else if variant === 'event'}
		<div class="py-2">
			{@render children?.()}
		</div>

		<div class="border-t border-soft">
			{@render platformStrip()}
		</div>
	{:else}
		{@render platformStrip()}
	{/if}
</footer>

<style>
	/* La page planning se masque le pied de page pour tenir dans la hauteur d'écran. Le sujet
	   du `:has` est `body` et sa cible la coque elle-même : sans cela, la règle frappait
	   n'importe quel `<footer>` du document. */
	:global(body:has(.footer-hidden) .footer-shell) {
		display: none;
	}
</style>
