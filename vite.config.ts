import devtoolsJson from 'vite-plugin-devtools-json'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	test: {
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// `tiptapParser`, utilisé par le rendu serveur des e-mails, tire les extensions de
		// l'éditeur et donc `tippy.js/dist/tippy.css`. Externalisé, le CSS remonte au
		// chargeur ESM de Node qui le refuse: on le fait traiter par Vite.
		server: { deps: { inline: ['tippy.js'] } },
	},
	server: { fs: { allow: ['media'] }, allowedHosts: ['mac-de-jo.local'] },
	optimizeDeps: {
		include: ['litepicker'],
	},
})
