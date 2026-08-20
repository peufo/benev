<script lang="ts">
	import { tick, untrack } from 'svelte'
	import { fly } from 'svelte/transition'
	import { elasticOut } from 'svelte/easing'
	import { TriangleAlertIcon } from '@lucide/svelte'
	import { beforeNavigate } from '$app/navigation'
	import { on } from 'svelte/events'

	interface Props {
		/** Le formulaire surveillé. */
		form: HTMLFormElement | undefined
		/**
		 * L'`id` de ce formulaire, passé en clair: le lire sur l'élément le ferait dépendre de
		 * ce que le spread d'`enhance()` laisse en place, et un `id` vide détacherait le bouton.
		 */
		formId: string
		/**
		 * Identifie l'enregistrement édité. Quand il change sans que le formulaire soit remonté
		 * — navigation d'une page d'admin à l'autre — les champs conservent ce qui a été saisi
		 * pour le précédent, l'état d'un `form` distant survivant à la navigation. Le formulaire
		 * est alors réinitialisé et la ligne de base reprise.
		 */
		key?: unknown
		/** `fields.allIssues()`: le récapitulatif vit ici, seul point visible à la soumission. */
		issues?: { message: string }[] | undefined
		pending?: boolean
		/** Joué après le `reset()` natif, pour ce qu'il ne restaure pas. */
		onreset?: () => void
	}

	let { form, formId, key, pending = false, onreset }: Props = $props()

	let baseline = $state('')
	let current = $state('')
	const isDirty = $derived(!!baseline && current !== baseline)

	let barElement = $state<HTMLDivElement>()
	let timers: ReturnType<typeof setTimeout>[] = []

	/**
	 * Comparer une signature du `FormData` plutôt que lever un drapeau à la première frappe:
	 * c'est le seul moyen de voir les champs cachés (`InputLocation`, `EventFormInputWeb`),
	 * et de repasser à « propre » quand la valeur d'origine est rétablie à la main.
	 * Les fichiers se comparent par leur identité, sans lire leur contenu.
	 */
	function serialize(element: HTMLFormElement) {
		let signature = ''
		for (const [key, value] of new FormData(element)) {
			const part =
				value instanceof File ? `${value.name}:${value.size}:${value.lastModified}` : value
			signature += `${key}=${part}\n`
		}
		return signature
	}

	/** Reprend la ligne de base: au montage, et après chaque enregistrement réussi. */
	export function rebase() {
		if (!form) return
		baseline = current = serialize(form)
	}

	/**
	 * Relit le formulaire. Les évènements DOM couvrent les champs saisis; un champ dont la
	 * valeur est écrite par du code — le champ caché d'un éditeur riche — n'en émet aucun et
	 * doit le signaler ici.
	 *
	 * La lecture attend le rendu: celui qui appelle vient d'écrire dans un `$state`, que Svelte
	 * ne pousse dans le champ caché qu'au flush suivant. Relire tout de suite prendrait la
	 * valeur précédente — la barre resterait en retard d'une frappe et ne se refermerait pas
	 * au retour à l'état d'origine.
	 */
	export function refresh() {
		void tick().then(() => {
			if (form) current = serialize(form)
		})
	}

	$effect(() => {
		const element = form
		if (!element) return

		// Ligne de base synchrone: différer d'un `tick` laisserait une frappe immédiate se
		// faire avaler par la ligne de base, et la barre resterait muette. Tous les champs
		// cachés de la page (lieu, site web, média) sont rendus en ligne, donc déjà là.
		rebase()
		// `focusout` rattrape le scraping d'icône d'`EventFormInputWeb`, qui réécrit un champ
		// caché 400 ms après la frappe, sans évènement.
		const cleanups = [
			on(element, 'input', refresh),
			on(element, 'change', refresh),
			on(element, 'focusout', refresh),
			on(element, 'reset', refresh),
		]
		return () => {
			for (const cleanup of cleanups) cleanup()
		}
	})

	// Le montage a déjà posé sa ligne de base, et y réinitialiser effacerait les valeurs d'une
	// soumission refusée: seuls les changements ultérieurs de `key` comptent.
	let watchedKey = untrack(() => key)
	$effect(() => {
		if (key === watchedKey) return
		watchedKey = key
		void reset()
	})

	beforeNavigate((navigation) => {
		if (!isDirty) return
		// Les tiroirs naviguent vers la même page (`?form_field=…`): ce n'est pas un départ.
		if (
			navigation.type !== 'leave' &&
			navigation.to?.url.pathname === navigation.from?.url.pathname
		)
			return
		navigation.cancel()
		// `leave` — onglet fermé, lien sortant: l'annulation y déclenche la fenêtre native du
		// navigateur, seul recours possible, et la page n'est plus regardée. Rien à animer.
		if (navigation.type !== 'leave') refuse()
	})

	/**
	 * Rejoue une animation. Retirer puis remettre la classe dans la même passe ne suffit pas:
	 * le style calculé n'a pas changé entre les deux et le navigateur ne redémarre rien. La
	 * lecture d'une métrique force le recalcul intermédiaire.
	 */
	function replay(element: HTMLElement, className: string, duration: number) {
		element.classList.remove(className)
		void element.offsetWidth
		element.classList.add(className)
		return setTimeout(() => element.classList.remove(className), duration)
	}

	/** Le départ est refusé: la page tremble et la barre se signale, seule sortie possible. */
	function refuse() {
		if (!barElement) return
		for (const timer of timers) clearTimeout(timer)
		navigator.vibrate?.([15, 40, 15])
		timers = [replay(document.body, 'screen-shake', 500), replay(barElement, 'save-bar-alert', 900)]
	}

	/** Rend au formulaire les valeurs de l'enregistrement chargé, et referme la barre. */
	async function reset() {
		form?.reset()
		// SvelteKit écoute lui aussi `reset` et relit le `FormData` après son propre `tick`:
		// on le laisse passer avant de restaurer ce qu'il ne connaît pas.
		await tick()
		onreset?.()
		await tick()
		rebase()
	}
</script>

{#if isDirty}
	<div
		bind:this={barElement}
		transition:fly={{ y: 80, duration: 1000, easing: elasticOut }}
		class={[
			'fixed bottom-2 left-1/2 -translate-x-1/2 z-30 p-2 sm:p-4',
			'surface flex flex-wrap items-center gap-3 p-3 ',
			'max-w-xl w-[calc(100%-16px)] border-2 border-primary shadow-xl',
		]}
	>
		<div class="flex gap-3">
			<TriangleAlertIcon size={20} class="text-warning shrink-0" />

			<p class="text-sm">Modification en cours !</p>
		</div>

		<div class="flex gap-3 ml-auto">
			<button type="button" class="btn btn-ghost btn-sm" onclick={() => reset()}>
				Réinitialiser
			</button>
			<!-- Un vrai bouton de soumission rattaché par `form`: garde la sémantique de la
					 touche Entrée et fonctionne sans JS, ce qu'un `requestSubmit()` perdrait. -->
			<button form={formId} type="submit" class="btn btn-primary btn-sm" disabled={pending}>
				Enregistrer les modifications
			</button>
		</div>
	</div>
{/if}
