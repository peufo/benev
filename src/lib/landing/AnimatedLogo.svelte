<script lang="ts">
	import { onMount } from 'svelte'

	interface Props {
		class?: string
	}

	let { class: klass = '' }: Props = $props()

	// Le tracé anime `stroke-dashoffset`, une propriété de peinture: contrairement à
	// `transform` et `opacity`, elle ne part pas au compositeur et s'exécute sur le thread
	// principal — que l'hydratation bloque par salves. Lancée au chargement, la séquence se
	// figeait en plein tracé. On attend donc que le thread soit libre. Le point et la
	// lévitation, eux, sont composités: ils n'ont jamais eu besoin d'attendre.
	let go = $state(false)

	onMount(() => {
		if (typeof requestIdleCallback !== 'function') {
			const id = setTimeout(() => (go = true), 250)
			return () => clearTimeout(id)
		}
		// `timeout` garantit le départ même si le thread ne devient jamais franchement libre.
		const id = requestIdleCallback(() => (go = true), { timeout: 1500 })
		return () => cancelIdleCallback(id)
	})

	// Les bénévoles qui rejoignent. Ce sont les mêmes points que celui de la marque —
	// `logo.svg` dit du sien qu'il est « l'humain » — en plus petits et en retard sur lui.
	// Chacun dérive vers la marque en apparaissant: `dx`/`dy` pointent vers l'extérieur
	// depuis son centre (≈103,100), en pourcentage de la taille du point lui-même.
	// Trois positions posées à la main: on ne génère pas ce qui se lit d'un coup d'œil.
	// `lift` et `dur` désaccordés d'un point à l'autre: à durées égales ils lévitraient au
	// même rythme, ce qui se lit comme un mécanisme plutôt que comme des gens.
	const joiners = [
		{ cx: 14, cy: 92, r: 7, dx: '-140%', dy: '-12%', delay: 1.2, lift: -5, dur: 5.2 },
		{ cx: 52, cy: 202, r: 6, dx: '-63%', dy: '125%', delay: 1.1, lift: -4, dur: 6.4 },
		{ cx: 172, cy: 190, r: 5.5, dx: '85%', dy: '110%', delay: 0.9, lift: -3.5, dur: 4.6 },
	]
</script>

<!--
	La marque se dessine, son point arrive, puis les bénévoles la rejoignent. Le tracé est en
	CSS pur — les longueurs de `logo.svg` sont connues (hampe 120, boucle 2π·40 ≈ 251.33),
	donc rien ne justifie de les mesurer au montage.

	La géométrie est reprise de `src/lib/assets/logo.svg` mais rendue inline pour que la marque
	suive `primary` / `secondary` via `currentColor`, comme l'exige la Theme-Only Rule. Le
	viewBox est élargi autour du glyphe pour loger les points sans toucher à ses coordonnées.
-->
<svg
	class="w-full h-auto aspect-square {klass}"
	class:go
	viewBox="-10 12 212 212"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<line
		class="stem text-primary"
		x1="60"
		y1="40"
		x2="60"
		y2="160"
		stroke="currentColor"
		stroke-width="24"
		stroke-linecap="round"
	/>
	<!-- Départ à 9 h (rotation d'un demi-tour) pour que la boucle parte de la hampe.
	     `linecap` rond pour que le trait en cours de tracé finisse comme la hampe; une
	     fois la boucle fermée le raccord tombe à 9 h, donc sous la hampe. -->
	<circle
		class="bowl text-primary"
		cx="100"
		cy="120"
		r="40"
		transform="rotate(180 100 120)"
		stroke="currentColor"
		stroke-width="24"
		stroke-linecap="round"
	/>
	<circle class="dot text-secondary" cx="140" cy="60" r="18" fill="currentColor" />

	{#each joiners as joiner (joiner.cx)}
		<g class="float" style="--lift: {joiner.lift}px; --dur: {joiner.dur}s">
			<circle
				class="joiner text-secondary"
				cx={joiner.cx}
				cy={joiner.cy}
				r={joiner.r}
				fill="currentColor"
				style="--dx: {joiner.dx}; --dy: {joiner.dy}; animation-delay: {joiner.delay}s"
			/>
		</g>
	{/each}
</svg>

<noscript>
	<!-- Sans JS, `.go` n'arrive jamais et la séquence resterait en pause sur son premier
	     état, marque non tracée. On rend alors la marque telle qu'elle finit. -->
	<style>
		.stem,
		.bowl,
		.dot,
		.joiner {
			animation: none !important;
		}
		.stem,
		.bowl {
			stroke-dasharray: none !important;
		}
	</style>
</noscript>

<style>
	/* Un cran au-dessus de la longueur réelle: le tiret couvre alors tout le tracé sans
	   risque de liseré résiduel, et un décalage de la même valeur l'efface entièrement. */
	.stem {
		--len: 121;
	}
	.bowl {
		--len: 252;
	}

	.stem,
	.bowl {
		stroke-dasharray: var(--len);
	}

	.stem {
		animation: draw 0.7s cubic-bezier(0.25, 1, 0.5, 1) 0.15s backwards;
	}

	.bowl {
		animation: draw 1.6s cubic-bezier(0.25, 1, 0.5, 1) 0.6s backwards;
	}

	/* Pas de rebond ici. `ease-overshoot` sert aux bascules de contrôles dans le produit;
	   sur la marque il ferait tape-à-l'œil. Toute la séquence garde la même décélération. */
	.dot {
		animation: pop 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.7s backwards;
	}

	/* Atténués: le point de la marque reste le seul à pleine intensité. */
	.joiner {
		opacity: 0.55;
		animation: join 0.6s cubic-bezier(0.25, 1, 0.5, 1) backwards;
	}

	.dot,
	.joiner {
		transform-box: fill-box;
		transform-origin: center;
	}

	/* La séquence attend que le thread principal soit libre (voir le script). En pause elle
	   reste sur son premier état — marque non tracée — donc le départ ne fait rien clignoter:
	   c'est déjà ce que le serveur a rendu. */
	.stem,
	.bowl,
	.dot,
	.joiner {
		animation-play-state: paused;
	}

	.go .stem,
	.go .bowl,
	.go .dot,
	.go .joiner {
		animation-play-state: running;
	}

	/* Lévitation continue. Portée par le `<g>` et non par le cercle: l'arrivée anime déjà
	   son `transform`, les deux s'écraseraient. Le `<g>` lévite dès le chargement — le
	   point qu'il porte étant encore invisible, chacun est déjà déphasé quand il paraît.
	   `ease-in-out` et non la décélération du reste: une oscillation veut du sinusoïdal. */
	.float {
		animation: float var(--dur) ease-in-out infinite;
	}

	@keyframes draw {
		from {
			stroke-dashoffset: var(--len);
		}
	}

	@keyframes pop {
		from {
			transform: scale(0);
			opacity: 0;
		}
	}

	@keyframes join {
		from {
			transform: translate(var(--dx), var(--dy)) scale(0.3);
			opacity: 0;
		}
	}

	@keyframes float {
		50% {
			transform: translateY(var(--lift));
		}
	}

	/* Sans animation, les valeurs de base sont déjà l'état final: il suffit de couper. */
	@media (prefers-reduced-motion: reduce) {
		.stem,
		.bowl,
		.dot,
		.joiner,
		.float {
			animation: none;
		}

		.stem,
		.bowl {
			stroke-dasharray: none;
		}
	}
</style>
