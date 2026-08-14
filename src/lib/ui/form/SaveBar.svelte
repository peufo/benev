<script lang="ts">
	import { tick } from 'svelte'
	import { fly } from 'svelte/transition'
	import { TriangleAlertIcon } from '@lucide/svelte'
	import { beforeNavigate } from '$app/navigation'
	import { transitionX } from 'fuma'

	interface Props {
		/** Le formulaire surveillé. */
		form: HTMLFormElement | undefined
		/**
		 * L'`id` de ce formulaire, passé en clair: le lire sur l'élément le ferait dépendre de
		 * ce que le spread d'`enhance()` laisse en place, et un `id` vide détacherait le bouton.
		 */
		formId: string
		/** `fields.allIssues()`: le récapitulatif vit ici, seul point visible à la soumission. */
		issues?: { message: string }[] | undefined
		pending?: boolean
		/** Joué après le `reset()` natif, pour ce qu'il ne restaure pas. */
		onreset?: () => void
	}

	let { form, formId, issues, pending = false, onreset }: Props = $props()

	let baseline = $state('')
	let current = $state('')
	const isDirty = $derived(!!baseline && current !== baseline)

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

	$effect(() => {
		const element = form
		if (!element) return

		const refresh = () => (current = serialize(element))
		// Ligne de base synchrone: différer d'un `tick` laisserait une frappe immédiate se
		// faire avaler par la ligne de base, et la barre resterait muette. Tous les champs
		// cachés de la page (lieu, site web, média) sont rendus en ligne, donc déjà là.
		rebase()
		// Le scraping d'icône d'`EventFormInputWeb` réécrit un champ caché 400 ms après la
		// frappe, sans évènement: la sortie du champ rattrape ce cas.
		const refreshLater = () => void tick().then(refresh)

		element.addEventListener('input', refresh)
		element.addEventListener('change', refresh)
		element.addEventListener('focusout', refreshLater)
		element.addEventListener('reset', refreshLater)
		return () => {
			element.removeEventListener('input', refresh)
			element.removeEventListener('change', refresh)
			element.removeEventListener('focusout', refreshLater)
			element.removeEventListener('reset', refreshLater)
		}
	})

	beforeNavigate((navigation) => {
		if (!isDirty) return
		// Les tiroirs naviguent vers la même page (`?form_field=…`): ce n'est pas un départ.
		if (
			navigation.type !== 'leave' &&
			navigation.to?.url.pathname === navigation.from?.url.pathname
		)
			return
		if (!confirm('Des modifications ne sont pas enregistrées. Quitter la page ?'))
			navigation.cancel()
	})

	async function handleReset() {
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
	<!-- Le layout racine décale la page par `padding-right` à l'ouverture d'un tiroir, mais un
	     élément `fixed` l'ignore: on reprend son calcul, marge comprise. -->
	<div
		class="fixed bottom-0 left-0 z-30 p-2 sm:p-4"
		style="right: {transitionX.current + (transitionX.current ? 6 : 0)}px"
		transition:fly={{ y: 80, duration: 250 }}
	>
		<!-- `border-hard` plutôt que le `border-soft` de `.surface`: la barre flotte au-dessus
		     d'un contenu quelconque et doit tenir seule. -->
		<div
			class="surface mx-auto flex max-w-3xl flex-wrap items-center gap-3 border-hard p-3 shadow-xl"
		>
			<TriangleAlertIcon size={20} class="text-warning shrink-0" />

			<div class="min-w-0 grow">
				<p class="text-sm">Attention, il reste des modifications non enregistrées !</p>
				{#if issues?.length}
					<!-- Pas de `text-error`: à 2.87:1 sur `base-100` il passe sous le seuil AA, or
					     ces lignes sont justement ce qu'il faut lire pour corriger. -->
					<ul class="mt-1 flex flex-col text-xs text-base-content/70">
						{#each issues.slice(0, 3) as issue (issue.message)}
							<li>{issue.message}</li>
						{/each}
						{#if issues.length > 3}
							<li>et {issues.length - 3} autre(s)</li>
						{/if}
					</ul>
				{/if}
			</div>

			<button type="button" class="btn btn-ghost btn-sm" onclick={handleReset}>
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
