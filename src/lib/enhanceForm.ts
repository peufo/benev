import { toast } from 'svelte-sonner'
import { errorMessage } from '#lib/error.js'

/**
 * Surface minimale d'une instance de formulaire distant, volontairement plus large
 * que `RemoteFormEnhanceInstance<Input>`: le callback reste ainsi acceptable par
 * n'importe quel `enhance()`, y compris celui d'un `createX | updateX` unifié dont
 * les deux entrées n'ont pas les mêmes champs.
 */
type EnhanceInstance = {
	submit(): Promise<boolean>
	readonly element: HTMLFormElement
}

type EnhanceFormOptions = {
	/** Toast d'attente affiché pendant la soumission. Aucun si absent. */
	pending?: string
	/** Toast de succès. Aucun si absent. */
	success?: string
	/** Toast affiché quand la validation échoue. Les messages par champ sont déjà rendus. */
	invalid?: string | false
	/** Vide le formulaire après un succès. */
	reset?: boolean
	/** Joué avant la soumission: retourner `false` l'annule (confirmation, garde…). */
	before?: () => boolean | Promise<boolean>
	/** Joué après un succès uniquement. */
	onsuccess?: (instance: EnhanceInstance) => void
	/** Joué quand la validation échoue, une fois les messages rendus sous les champs. */
	oninvalid?: (instance: EnhanceInstance) => void
}

/**
 * Fabrique le callback de `remoteForm.enhance(...)` avec le traitement que tout
 * formulaire du produit doit avoir:
 *
 * - `submit()` renvoie `false` quand la validation échoue: ce n'est **pas** un succès,
 *   et les messages sont déjà rendus sous les champs.
 * - Une erreur levée s'affiche par `errorMessage(err)` de `#lib/error.js`, qui lit le message
 *   français écrit par le serveur.
 *
 * ```svelte
 * <form {...sendMessage.enhance(enhanceForm({
 *   pending: 'Envoie...', success: 'Merci pour ton message', reset: true,
 * }))}>
 * ```
 */
export function enhanceForm({
	pending,
	success,
	invalid = 'Formulaire incorrect',
	reset = false,
	before,
	onsuccess,
	oninvalid,
}: EnhanceFormOptions = {}) {
	return async (instance: EnhanceInstance) => {
		if (before && !(await before())) return
		const id = pending ? toast.loading(pending) : undefined
		// `toast.dismiss()` sans argument ferme *tous* les toasts: ne l'appeler qu'avec un id.
		const clearPending = () => id !== undefined && toast.dismiss(id)
		try {
			if (!(await instance.submit())) {
				if (invalid) toast.warning(invalid, { id })
				else clearPending()
				oninvalid?.(instance)
				return
			}
			if (success) toast.success(success, { id })
			else clearPending()
			if (reset) instance.element.reset()
			onsuccess?.(instance)
		} catch (err) {
			console.error(err)
			toast.error(errorMessage(err), { id })
		}
	}
}
