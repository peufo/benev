import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	// `accessors: process.env.TEST` retiré: l'option est dépréciée en mode runes et
	// Svelte 5 exige un booléen strict (la variable d'environnement est une chaîne).
	// Aucun test du dépôt ne s'appuyait dessus.
	kit: {
		adapter: adapter(),
		// Requis par les remote functions (`form()`/`query()` de `$app/server`), sur
		// lesquelles reposent les composants d'input de fuma 2.
		experimental: {
			remoteFunctions: true,
		},
	},
	compilerOptions: {
		experimental: {
			async: true,
		},
	},
}
