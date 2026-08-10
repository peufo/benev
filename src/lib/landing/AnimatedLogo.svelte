<script lang="ts">
	import benevio from '$lib/assets/benevio.svg'

	interface Props {
		class?: string
	}

	let { class: klass = '' }: Props = $props()
</script>

<!--
	La marque se dessine: la hampe du « b » descend, la boucle se referme, puis le point vert
	arrive. Le tracé est en CSS pur — les longueurs de `logo.svg` sont connues (hampe 120,
	boucle 2π·40 ≈ 251.33), donc rien ne justifie de les mesurer au montage.

	La géométrie est reprise de `src/lib/assets/logo.svg` mais rendue inline pour que la marque
	suive `primary` / `secondary` via `currentColor`, comme l'exige la Theme-Only Rule.
-->
<!-- Les tailles internes sont relatives: le hero pilote l'échelle par la largeur du conteneur. -->
<div class="flex flex-col items-center gap-5 {klass}">
	<svg
		class="w-3/5 h-auto aspect-square"
		viewBox="0 0 200 200"
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
		<!-- Départ à 9 h (rotation d'un demi-tour) pour que la boucle parte de la hampe -->
		<circle
			class="bowl text-primary"
			cx="100"
			cy="120"
			r="40"
			transform="rotate(180 100 120)"
			stroke="currentColor"
			stroke-width="24"
		/>
		<circle class="dot text-secondary" cx="140" cy="60" r="18" fill="currentColor" />
	</svg>

	<img src={benevio} alt="benevio" class="wordmark w-full" />
</div>

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
		animation: draw 0.9s cubic-bezier(0.25, 1, 0.5, 1) 0.6s backwards;
	}

	/* Pas de rebond ici. `ease-overshoot` sert aux bascules de contrôles dans le produit;
	   sur la marque il ferait tape-à-l'œil. Toute la séquence garde la même décélération. */
	.dot {
		transform-box: fill-box;
		transform-origin: center;
		animation: pop 0.5s cubic-bezier(0.25, 1, 0.5, 1) 1.35s backwards;
	}

	.wordmark {
		animation: rise 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.5s backwards;
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

	@keyframes rise {
		from {
			transform: translateY(0.75rem);
			opacity: 0;
		}
	}

	/* Sans animation, les valeurs de base sont déjà l'état final: il suffit de couper. */
	@media (prefers-reduced-motion: reduce) {
		.stem,
		.bowl,
		.dot,
		.wordmark {
			animation: none;
		}

		.stem,
		.bowl {
			stroke-dasharray: none;
		}
	}
</style>
