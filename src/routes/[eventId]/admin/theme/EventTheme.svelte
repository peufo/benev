<script lang="ts">
	import type { Event } from '@prisma/client'
	import { theme } from './store'

	export let event: Event
	// theme.set(event)
	$: theme.set(event)
</script>

<div
	class="background"
	class:background-poster={$theme.backgroundPoster}
	style="
    --media: url(/media/{event.posterId});
    --bg-blur: {$theme.backgroundBlur}px;
    --bg-color: {$theme.backgroundColor};
    --bg-brightness: {$theme.backgroundBrightness}%;
    --bg-whiteness: {$theme.backgroundWhiteness};
  "
>
	<div class="background-blur" />
</div>

<style>
	:global(.bg-base-100) {
		background-color: hsl(var(--b1) / var(--card-opacity, 1));
	}
	:global(.bg-base-200) {
		background-color: hsl(var(--b2) / var(--card-opacity, 1));
	}
	:global(.bg-base-300) {
		background-color: hsl(var(--b3) / var(--card-opacity, 1));
	}
	:global(.border, .card.bordered) {
		border-color: hsl(var(--b2) / calc(var(--card-opacity, 1) / 2));
	}

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
		background-color: hsl(var(--b1) / var(--bg-whiteness));
		backdrop-filter: blur(var(--bg-blur)) brightness(var(--bg-brightness));
	}
</style>
