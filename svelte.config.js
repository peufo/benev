import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import rehypeDocSections from './src/lib/doc/engine/rehypeDocSections.js'

// Date et commit du build, que `$lib/version.ts` redécoupe. Le sha vient du workflow, `.git`
// étant hors du contexte de l'image: absent, un build local se dit simplement `dev`.
const commit = process.env.BUILD_COMMIT?.slice(0, 7) ?? 'dev'
const version = `${new Date().toISOString().slice(0, 10)}_${commit}`

/** @type {import('@sveltejs/kit').Config} */
export default {
	// `.svx` plutôt que `.md`: `svelte-check` lit cette liste, et `.md` y ferait entrer
	// AGENTS.md, DESIGN.md et PRODUCT.md, qui ne sont pas des composants.
	extensions: ['.svelte', '.svx'],
	// mdsvex d'abord: il rend du Svelte à partir du markdown, que `vitePreprocess` traite
	// ensuite pour le `lang="ts"` des blocs `<script>` d'une page de documentation.
	// `rehypeDocSections` découpe la page en chapitres: l'auteur écrit `## Titre`, jamais la carte.
	preprocess: [
		mdsvex({ extensions: ['.svx'], rehypePlugins: [rehypeDocSections] }),
		vitePreprocess(),
	],
	kit: {
		adapter: adapter(),
		version: { name: version },
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
