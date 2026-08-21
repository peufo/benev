/**
 * Politique de réessai du worker d'emails.
 *
 * Isolée du transport pour rester sans effet de bord: `emailQueue` ouvre une connexion SMTP dès
 * son chargement, ce qui rendrait ces règles intestables.
 */

/** Attentes entre deux tentatives. Leur nombre fixe le nombre de réessais. */
export const RETRY_DELAYS = [15_000, 60_000, 300_000]
export const MAX_ATTEMPTS = RETRY_DELAYS.length + 1

/**
 * Un code de réponse SMTP en 5xx est définitif — destinataire inexistant, domaine mort, message
 * refusé. Réessayer ne ferait que répéter le même refus. Les 4xx et les erreurs réseau, qui
 * n'ont pas de `responseCode`, sont passagères.
 */
export function isPermanentError(err: unknown): boolean {
	const code = (err as { responseCode?: unknown } | null)?.responseCode
	return typeof code === 'number' && code >= 500 && code < 600
}

/**
 * Attente avant la tentative suivante, `null` quand il n'y en a plus.
 * `attempts` est le nombre de tentatives déjà consommées.
 */
export function nextDelay(attempts: number): number | null {
	if (attempts < 1 || attempts >= MAX_ATTEMPTS) return null
	return RETRY_DELAYS[attempts - 1]
}
