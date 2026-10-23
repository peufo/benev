import type { HandleClientError } from '@sveltejs/kit/hooks'
import { normalizeCaughtError } from '#lib/error.js'

/** Le pendant de `handleError` côté serveur, pour ce qui échoue pendant une navigation client. */
export const handleError: HandleClientError = (caught) => {
	if (caught.kind === 'unknown') console.error(caught.error)
	return normalizeCaughtError(caught)
}
