<script lang="ts">
	import { PauseIcon, PlayIcon } from '@lucide/svelte'
	import type { PosterEvent } from './posterEvent.js'

	let { events }: { events: PosterEvent[] } = $props()

	const format = new Intl.NumberFormat('fr-CH')

	/** En pixels par seconde : assez lent pour qu'on regarde une affiche, pas le mouvement. */
	const SPEED = 30
	/** Après un geste, le temps de lâcher prise avant que la bande ne reparte d'elle-même. */
	const RESUME_DELAY = 1500

	let strip: HTMLDivElement
	let hovered = false
	let dragging = false
	let touching = false
	let resumeAt = 0
	let paused = $state(false)

	$effect(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

		// La position se tient ici et non dans `scrollLeft`, que le navigateur arrondit au pixel :
		// à 30px/s, une demi-image par frame se perdrait et la bande resterait figée.
		let position = strip.scrollLeft
		let last = performance.now()
		let frame = requestAnimationFrame(function tick(now) {
			const half = strip.scrollWidth / 2
			const idle = !paused && !hovered && !dragging && !touching && now >= resumeAt
			if (idle) {
				position += (SPEED * (now - last)) / 1000
				// Les deux copies sont identiques : sauter d'une moitié ne se voit pas.
				if (position >= half) position -= half
				strip.scrollLeft = position
			} else {
				position = strip.scrollLeft
			}
			last = now
			frame = requestAnimationFrame(tick)
		})
		return () => cancelAnimationFrame(frame)
	})

	let dragStartX = 0
	let dragStartScroll = 0

	function onpointerdown(event: PointerEvent) {
		// Le doigt garde le défilement natif, inertie comprise : seule la souris se glisse ici.
		if (event.pointerType !== 'mouse' || event.button !== 0) return
		dragging = true
		dragStartX = event.clientX
		dragStartScroll = strip.scrollLeft
		strip.setPointerCapture(event.pointerId)
	}

	function onpointermove(event: PointerEvent) {
		if (!dragging) return
		const half = strip.scrollWidth / 2
		let next = dragStartScroll - (event.clientX - dragStartX)
		// Le glisser fait le tour comme le défilement, dans les deux sens.
		if (next < 0) {
			next += half
			dragStartScroll += half
		} else if (next >= half) {
			next -= half
			dragStartScroll -= half
		}
		strip.scrollLeft = next
	}

	function endDrag() {
		if (!dragging) return
		dragging = false
		resumeAt = performance.now() + RESUME_DELAY
	}

	function endTouch() {
		touching = false
		resumeAt = performance.now() + RESUME_DELAY
	}
</script>

{#snippet posters(copy: boolean)}
	<ul class={['flex shrink-0', copy && 'motion-reduce:hidden']} aria-hidden={copy || undefined}>
		{#each events as event (event.posterId)}
			<!-- Une marge plutôt qu'un `gap` : les deux copies doivent mesurer exactement la moitié
			     de la bande, sans quoi la boucle saute. -->
			<li class="w-36 md:w-40 shrink-0 pr-5 box-content">
				<figure>
					<img
						src="/media/{event.posterId}?size=a3"
						srcset="
							/media/{event.posterId}?size=a4 210w,
							/media/{event.posterId}?size=a3 297w,
							/media/{event.posterId}?size=a2 420w
						"
						sizes="160px"
						width="297"
						height="420"
						loading="lazy"
						decoding="async"
						draggable="false"
						alt={copy ? '' : `Affiche de ${event.name}`}
						class="w-full h-auto aspect-210/297 object-cover rounded-field border border-soft bg-base-200"
					/>
					<figcaption class="mt-2 flex flex-wrap gap-x-3 text-sm text-base-content/70 tabular-nums">
						<span>{format.format(event.members)} bénévoles</span>
						{#if event.hours}
							<span>{format.format(event.hours)} heures</span>
						{/if}
					</figcaption>
				</figure>
			</li>
		{/each}
	</ul>
{/snippet}

<section aria-label="Affiches d'événements organisés avec benevio" class="relative py-12 md:py-16">
	<div
		bind:this={strip}
		class="strip flex overflow-x-auto scrollbar-none select-none cursor-grab active:cursor-grabbing motion-reduce:px-4 motion-reduce:cursor-auto"
		role="presentation"
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
		{onpointerdown}
		{onpointermove}
		onpointerup={endDrag}
		onpointercancel={endDrag}
		ontouchstart={() => (touching = true)}
		ontouchend={endTouch}
		ontouchcancel={endTouch}
	>
		{@render posters(false)}
		{@render posters(true)}
	</div>
	<!-- Hors de la bande et non dedans : son masque effacerait le bouton avec le bord droit. -->
	<button
		type="button"
		class="btn btn-sm btn-circle bg-base-100 border-soft shadow-sm absolute top-14 md:top-18 right-4 sm:right-6 motion-reduce:hidden"
		aria-label={paused ? 'Reprendre le défilement' : 'Mettre en pause le défilement'}
		onclick={() => (paused = !paused)}
	>
		{#if paused}
			<PlayIcon size={16} class="opacity-70" />
		{:else}
			<PauseIcon size={16} class="opacity-70" />
		{/if}
	</button>
</section>

<style>
	.strip {
		mask-image: linear-gradient(
			to right,
			transparent,
			#000 4rem,
			#000 calc(100% - 4rem),
			transparent
		);
	}
	/* Au repos, le fondu estomperait la première affiche au lieu de signaler une suite. */
	@media (prefers-reduced-motion: reduce) {
		.strip {
			mask-image: none;
		}
	}
</style>
