import { isHttpError } from '@sveltejs/kit'

/**
 * Les seules erreurs auxquelles un composant réagit autrement qu'en affichant leur message.
 * Un refus qui ne fait que s'afficher n'a pas de code: son message, écrit en français là où il
 * est levé, suffit.
 */
export type ErrorCode =
	'invalid_credentials' | 'account_exists' | 'account_invited' | 'reset_rate_limited'

const FALLBACK = 'Une erreur est survenue'

export function defaultErrorMessage(status: number): string {
	switch (status) {
		case 400:
			return "Cette demande n'est pas valide"
		case 401:
			return 'Connecte-toi pour continuer'
		case 403:
			return "Tu n'as pas les droits pour faire ça"
		case 404:
			return 'Page introuvable'
		case 429:
			return 'Trop de demandes, réessaie dans quelques minutes'
		default:
			return FALLBACK
	}
}

/** Le message que SvelteKit donne à un `error(status)` levé sans texte. */
function isBareMessage({ status, message }: { status: number; message: string }) {
	return message === `Error: ${status}`
}

type Caught =
	| { kind: 'app' | 'framework' | 'validation'; error: { status: number; message: string } }
	| { kind: 'unknown'; error: unknown }

/**
 * Le corps commun des deux hooks `handleError`. Ce qu'il renvoie est fusionné dans le corps
 * d'origine: rien, et le message du point d'appel est gardé, `code` compris.
 */
export function normalizeCaughtError(caught: Caught): { message: string } | undefined {
	if (caught.kind === 'unknown') return { message: FALLBACK }
	if (caught.kind === 'app' && !isBareMessage(caught.error)) return
	return { message: defaultErrorMessage(caught.error.status) }
}

/**
 * Le message à montrer pour une erreur rattrapée côté client. `HttpError` n'étend pas `Error`,
 * d'où ce point d'entrée unique. Une 5xx ou une erreur réseau n'en dit pas plus que le repli
 * du composant, qui sait au moins quel geste a échoué.
 */
export function errorMessage(err: unknown, fallback = FALLBACK): string {
	if (!isHttpError(err) || err.status >= 500) return fallback
	if (isBareMessage(err.body)) return defaultErrorMessage(err.status)
	return err.body.message
}

export function errorCode(err: unknown): ErrorCode | undefined {
	return isHttpError(err) ? err.body.code : undefined
}
