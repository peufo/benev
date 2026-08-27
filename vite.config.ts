import devtoolsJson from 'vite-plugin-devtools-json'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	test: {
		environment: 'node',
		setupFiles: ['src/tests/setupEnv.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// `tiptapParser`, utilisé par le rendu serveur des e-mails, tire les extensions de
		// l'éditeur et donc `tippy.js/dist/tippy.css`. Externalisé, le CSS remonte au
		// chargeur ESM de Node qui le refuse: on le fait traiter par Vite.
		server: { deps: { inline: ['tippy.js'] } },
	},
	// fuma est lié par `file:../fuma`, donc `node_modules/fuma` est un lien symbolique vers un
	// dossier qui garde ses propres `@sveltejs/kit`, `svelte` et `zod` pour son développement. Sans
	// dédoublonnage, `fuma/server` lève un `redirect()` issu de son exemplaire de kit, que
	// celui de benev ne reconnaît pas: la redirection remonte alors en erreur 500. Pour zod, c'est
	// la configuration globale posée par `z.config()` qui est propre à chaque exemplaire: les
	// schémas construits dans fuma resteraient en anglais.
	resolve: { dedupe: ['@sveltejs/kit', 'svelte', 'zod'] },
	server: { fs: { allow: ['media', '../fuma'] }, allowedHosts: ['mac-de-jo.local'] },
	optimizeDeps: {
		// `litepicker` n'est importé nulle part dans `src/`: c'est une dépendance CommonJS du
		// `RangePicker` de fuma. Comme `fuma` est exclu du pré-bundling pour que ses
		// modifications soient vues à chaud, la sienne doit être demandée explicitement — sans
		// quoi le serveur de dev sert du CJS brut. Elle reste donc déclarée dans package.json.
		include: ['litepicker'],
		exclude: ['fuma'],
	},
})
