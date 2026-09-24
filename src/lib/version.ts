import { version } from '$app/env'

/**
 * Découpe le `kit.version.name` gelé au build par `svelte.config.js`, qui seul compose l'autre
 * moitié de cet encodage. C'est aussi la chaîne que compare le store `updated` de SvelteKit.
 */
export function parseVersion(name: string) {
	const [date, commit] = name.split('_')
	return {
		/** Date du build, au format `YYYY-MM-DD`. */
		date,
		/** Sha court du commit déployé, ou `dev` hors dépôt et hors CI. */
		commit,
		/** Hors dépôt et hors CI, le sha ne désigne aucune source: pas de lien à poser. */
		hasSource: commit !== 'dev',
	}
}

export const APP_VERSION = parseVersion(version)
