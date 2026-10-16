/**
 * Module virtuel de SvelteKit, que le plugin résout et que seuls ses types internes déclarent.
 * `setupEnv.ts` l'appelle pour peupler `$app/env/*` hors de tout serveur.
 */
declare module '<sveltekit:generated>/env/config.js' {
	export function set_env(environment: Record<string, string | undefined>): void
}
