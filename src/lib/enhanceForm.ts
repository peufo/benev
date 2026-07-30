import { isHttpError } from '@sveltejs/kit'
import { toast } from 'svelte-sonner'
import type { RemoteForm, RemoteFormInput } from '@sveltejs/kit'

type EnhanceCallback<Input extends RemoteFormInput | void> = Parameters<
	RemoteForm<Input, unknown>['enhance']
>[0]
type EnhanceInstance<Input extends RemoteFormInput | void> = Parameters<EnhanceCallback<Input>>[0]

type EnhanceFormOptions<Input extends RemoteFormInput | void> = {
	/** Toast d'attente affiché pendant la soumission. Aucun si absent. */
	pending?: string
	/** Toast de succès. Aucun si absent. */
	success?: string
	/** Toast affiché quand la validation échoue. Les messages par champ sont déjà rendus. */
	invalid?: string | false
	/** Vide le formulaire après un succès. */
	reset?: boolean
	/** Joué après un succès uniquement. */
	onsuccess?: (instance: EnhanceInstance<Input>) => void
}

/**
 * Fabrique le callback de `remoteForm.enhance(...)` avec le traitement que tout
 * formulaire du produit doit avoir:
 *
 * - `submit()` renvoie `false` quand la validation échoue — ce n'est **pas** un succès,
 *   et les messages sont déjà rendus sous les champs.
 * - Une erreur levée est un `HttpError`, qui n'étend pas `Error`: son message se lit
 *   dans `err.body.message` après `isHttpError(err)`.
 *
 * Le callback reçoit l'instance du formulaire (`submit`, `fields`, `element`…).
 * `data` et `form` ont été retirés de cet objet: leurs accesseurs lèvent une
 * exception, donc ne jamais les déstructurer.
 *
 * ```svelte
 * <form {...sendMessage.enhance(enhanceForm({
 *   pending: 'Envoie...', success: 'Merci pour ton message', reset: true,
 * }))}>
 * ```
 */
export function enhanceForm<Input extends RemoteFormInput | void>({
	pending,
	success,
	invalid = 'Formulaire incorrect',
	reset = false,
	onsuccess,
}: EnhanceFormOptions<Input> = {}): EnhanceCallback<Input> {
	return async (instance) => {
		const id = pending ? toast.loading(pending) : undefined
		// `toast.dismiss()` sans argument ferme *tous* les toasts: ne l'appeler qu'avec un id.
		const clearPending = () => id !== undefined && toast.dismiss(id)
		try {
			if (!(await instance.submit())) {
				if (invalid) toast.warning(invalid, { id })
				else clearPending()
				return
			}
			if (success) toast.success(success, { id })
			else clearPending()
			if (reset) instance.element.reset()
			onsuccess?.(instance)
		} catch (err) {
			console.error(err)
			// `HttpError` n'étend pas `Error`: `String(err)` rendrait du JSON.
			if (isHttpError(err)) toast.error(err.body.message, { id })
			else toast.error('Une erreur est survenue', { id })
		}
	}
}
