<script lang="ts">
	import { untrack } from 'svelte'

	import type { Event } from '@prisma/client'
	import { theme } from './state.svelte'

	interface Props {
		event: Event
	}

	let { event }: Props = $props()
	// Une copie, jamais la référence: les champs d'aperçu écrivent dans `theme`, et la partager
	// reviendrait à muter `data.event` — dont les sections se servent pour se rétablir.
	let seeded = untrack(() => {
		Object.assign(theme, event)
		return event.id
	})

	/**
	 * Reposé au changement d'évènement seulement. Toute soumission distante fait rejouer les
	 * `load`, et recopier à chaque nouvelle `data` écrasait l'habillage en cours d'édition:
	 * l'image de fond choisie dans la médiathèque disparaissait dès l'envoi suivant, elle seule
	 * des trois champs image, étant la seule à vivre dans `theme`.
	 */
	$effect.pre(() => {
		if (event.id === seeded) return
		seeded = event.id
		Object.assign(theme, event)
	})
</script>

<div
	class="event-background background"
	class:background-poster={!!theme.backgroundImageId}
	style="
		--media: url(/media/{theme.backgroundImageId});
		--bg-blur: {theme.backgroundBlur}px;
		--bg-color: {theme.backgroundColor};
		--bg-brightness: {theme.backgroundBrightness}%;
		--bg-whiteness: {theme.backgroundWhiteness};
	"
>
	<div class="background-blur"></div>
</div>

<style>
	/* Les surfaces se translucident pour laisser voir le fond de l'évènement. Ces règles
	   sont `:global` donc elles partent dans la feuille de style de la route, que SvelteKit
	   charge dès le préchargement au survol d'un lien: sans le `:has`, survoler un lien
	   vers un évènement repeindrait tout le site. Le `:has` les arrime au montage réel du
	   fond. */
	/* TODO: désactivé pour l'instant */

	/* :global(body:has(.event-background) .bg-base-100) {
		background-color: color-mix(
			in oklab,
			var(--color-base-100) calc(var(--card-opacity, 1) * 100%),
			transparent
		);
	}
	:global(body:has(.event-background) .bg-base-200) {
		background-color: color-mix(
			in oklab,
			var(--color-base-200) calc(var(--card-opacity, 1) * 100%),
			transparent
		);
	}
	:global(body:has(.event-background) .bg-base-300) {
		background-color: color-mix(
			in oklab,
			var(--color-base-300) calc(var(--card-opacity, 1) * 100%),
			transparent
		);
	} */

	.background {
		z-index: -10;
		position: fixed;
		background-color: var(--bg-color);
		background-position: center;
		background-repeat: space;
		background-size: cover;
		height: 100vh;
		width: 100%;
	}

	.background-poster {
		background-image: var(--media);
	}

	.background-poster > .background-blur {
		position: fixed;
		inset: 0;
		background-color: color-mix(
			in oklab,
			var(--color-base-100) calc(var(--bg-whiteness) * 100%),
			transparent
		);
		backdrop-filter: blur(var(--bg-blur)) brightness(var(--bg-brightness));
	}
</style>
