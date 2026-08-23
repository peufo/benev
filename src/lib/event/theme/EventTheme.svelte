<script lang="ts">
	import { untrack } from 'svelte'

	import type { Event } from '@prisma/client'
	import { THEME_PRESETS, type ThemePresetKey } from '$lib/constant'
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

	// Le garde couvre la clé restée en base après le retrait d'un thème de la table.
	let preset = $derived(
		theme.backgroundPreset && theme.backgroundPreset in THEME_PRESETS
			? THEME_PRESETS[theme.backgroundPreset as ThemePresetKey]
			: undefined
	)
	// Une image choisie dans la médiathèque l'emporte sur celle du thème.
	let backgroundUrl = $derived(
		theme.backgroundImageId ? `/media/${theme.backgroundImageId}` : preset?.image
	)
</script>

<div
	class="event-background background"
	class:background-poster={!!backgroundUrl}
	style="
		--media: {backgroundUrl ? `url(${backgroundUrl})` : 'none'};
		--bg-blur: {theme.backgroundBlur}px;
		--bg-color: {theme.backgroundColor};
		--bg-brightness: {theme.backgroundBrightness}%;
		--bg-whiteness: {theme.backgroundWhiteness};
		--bg-grain: {theme.backgroundGrain ?? 0};
	"
>
	<div class="background-blur"></div>
	<div class="background-grain"></div>
</div>

<style>
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

	/* Peint après le voile, donc hors d'atteinte de son `backdrop-filter`: un grain flou n'est
	   plus un grain.

	   La turbulence est copiée dans l'alpha, que `tableValues="1 0 1"` rend opaque à ses deux
	   extrêmes et transparent en son milieu: le grain éclaircit alors autant qu'il assombrit.
	   Posée telle quelle, elle n'est qu'un gris moyen à 50% d'opacité — il faut la monter si
	   haut pour la voir qu'elle ternit le fond avant de le grener. */
	.background-grain {
		position: fixed;
		inset: 0;
		pointer-events: none;
		/* Plafond mesuré: au-delà, la dérive de luminosité prend le pas sur la texture. */
		opacity: calc(var(--bg-grain) * 0.45);
		background-repeat: repeat;
		/* Rendue à 1:1 en pixels CSS: agrandie, la trame se lit comme un motif. */
		background-size: 200px 200px;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='table' tableValues='1 0 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E");
	}
</style>
