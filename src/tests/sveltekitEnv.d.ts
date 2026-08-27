/**
 * Module virtuel où SvelteKit compile `src/env.ts`; il n'a pas de déclaration publique. Seul
 * `setupEnv.ts` y touche, faute d'un serveur pour appeler `set_env` sous Vitest.
 *
 * Ce fichier ne doit garder ni import ni export au niveau racine: une déclaration de module
 * ambiante n'est possible que dans un fichier qui n'est pas lui-même un module.
 */
declare module '__sveltekit/env' {
	export function set_env(env: Record<string, string | undefined>): void
}
