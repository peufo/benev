import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true,
			explicitEnvironmentVariables: true,
		},
	},
	compilerOptions: {
		experimental: {
			async: true,
		},
	},
}
