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
	},
}
