import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import rehypeDocSections from './src/lib/doc/engine/rehypeDocSections.js'
import devtoolsJson from 'vite-plugin-devtools-json'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

// Date et commit du build, que `#lib/version.ts` redécoupe. Le sha vient du workflow, `.git`
// étant hors du contexte de l'image: absent, un build local se dit simplement `dev`.
const commit = process.env.BUILD_COMMIT?.slice(0, 7) ?? 'dev'

const version = `${new Date().toISOString().slice(0, 10)}_${commit}`

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			// `.svx` plutôt que `.md`: `svelte-check` lit cette liste, et `.md` y ferait entrer
			// AGENTS.md, DESIGN.md et PRODUCT.md, qui ne sont pas des composants.
			extensions: ['.svelte', '.svx'],
			// mdsvex d'abord: il rend du Svelte à partir du markdown, que `vitePreprocess` traite
			// ensuite pour le `lang="ts"` des blocs `<script>` d'une page de documentation.
			preprocess: [
				mdsvex({ extensions: ['.svx'], rehypePlugins: [rehypeDocSections] }),
				vitePreprocess(),
			],
			compilerOptions: { experimental: { async: true } },
			adapter: adapter(),
			version: { name: version },
			experimental: { remoteFunctions: true },
		}),
		devtoolsJson(),
	],
	test: {
		environment: 'node',
		setupFiles: ['src/tests/setupEnv.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// `tiptapParser`, utilisé par le rendu serveur des e-mails, tire les extensions de
		// l'éditeur et donc `tippy.js/dist/tippy.css`. Externalisé, le CSS remonte au
		// chargeur ESM de Node qui le refuse: on le fait traiter par Vite.
		server: { deps: { inline: ['tippy.js'] } },
	},
	// Lié (`bun run fuma:local`), fuma résout ses imports depuis `../fuma/node_modules`; publié, il
	// embarque encore son propre `zod`. Sans dédoublonnage, `fuma/server` lève un `redirect()` issu de son exemplaire de kit, que
	// celui de benev ne reconnaît pas: la redirection remonte alors en erreur 500. Pour zod, c'est
	// la configuration globale posée par `z.config()` qui est propre à chaque exemplaire: les
	// schémas construits dans fuma resteraient en anglais. Pour dayjs, c'est l'`include` ci-dessous
	// qui ne porterait pas: il résout depuis la racine du projet, donc pas l'exemplaire imbriqué.
	resolve: { dedupe: ['@sveltejs/kit', 'svelte', 'zod', 'dayjs'] },
	server: {
		fs: { allow: ['media', '../fuma'] },
		allowedHosts: ['mac-de-jo.local'],
		watch: { ignored: ['**/.claude/worktrees/**'] },
	},
	optimizeDeps: {
		// Dépendances CommonJS atteintes depuis fuma, exclu du pré-bundling pour que ses
		// modifications soient vues à chaud: sans demande explicite, le serveur de dev en sert
		// le CJS brut, dont l'import `default` n'existe pas.
		// - `litepicker`, dépendance du `RangePicker`, importée nulle part dans `src/`. Elle
		//   reste déclarée dans package.json pour cette raison.
		// - les greffons dayjs de l'`InputDateTime`. `src/lib/dayjs.ts` importe les mêmes, mais
		//   sans l'extension `.js`: deux spécificateurs distincts pour l'optimiseur, donc ceux
		//   de fuma passent à travers.
		include: ['litepicker', 'dayjs/plugin/utc.js', 'dayjs/plugin/timezone.js'],
		exclude: ['fuma'],
	},
})
