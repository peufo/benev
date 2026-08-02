import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'

export default ts.config(
	{
		ignores: [
			'.svelte-kit/',
			'build/',
			'package/',
			'dumps/',
			'media/',
			'static/',
			'test-results/',
			'playwright-report/',
		],
	},
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
			},
		},
		rules: {
			// Les blocs `$:` sont réévalués à chaque changement de dépendance: une
			// valeur affectée en fin de bloc est bien relue au passage suivant, ce que
			// l'analyse linéaire de la règle ne voit pas.
			'no-useless-assignment': 'off',
		},
	},
	{
		// Les fichiers `.cjs` (configs Prettier, PostCSS) sont du CommonJS par nature.
		files: ['**/*.cjs'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
	{
		rules: {
			// TypeScript résout lui-même les identifiants: `no-undef` ne voit pas les
			// constructions purement typées ($$Generic, `generics=` de Svelte, le
			// namespace global PrismaJson) et les signale à tort.
			// https://typescript-eslint.io/troubleshooting/faqs/eslint#i-get-errors-from-no-undef
			'no-undef': 'off',
			// `() => {}` sert de valeur par défaut aux props callback et de no-op de
			// nettoyage: c'est intentionnel, pas un oubli.
			'@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					// `_` marque une valeur volontairement ignorée (params, déstructuration).
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					// `const { id, ...rest } = obj` sert à retirer des clés: les clés
					// écartées ne sont jamais lues, c'est le but.
					ignoreRestSiblings: true,
					// `catch (err)` sans usage de `err` reste un catch légitime.
					caughtErrors: 'none',
				},
			],
			// Nouveauté d'eslint-plugin-svelte 3: impose `resolve()` de $app/paths sur
			// chaque href/goto. C'est une migration SvelteKit à part entière (plus de
			// 150 occurrences), pas un prérequis du lint.
			'svelte/no-navigation-without-resolve': 'off',
		},
	},
	{
		// Code rapatrié tel quel depuis fuma 1.0.21 (branche `sv-4`), en attendant la
		// bascule vers fuma 2. Le reformater le ferait diverger de l'amont et
		// compliquerait le tri de ce qui doit être supprimé au profit du paquet.
		// Placé en dernier pour l'emporter sur les blocs généraux ci-dessus.
		// Ces exceptions disparaissent avec le dossier.
		files: ['src/lib/fuma-legacy/**', 'src/lib/server/fuma-legacy/**'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-unnecessary-type-constraint': 'off',
			'svelte/require-each-key': 'off',
			'svelte/no-dupe-on-directives': 'off',
			'svelte/no-useless-mustaches': 'off',
			'svelte/no-at-html-tags': 'off',
			'no-extra-boolean-cast': 'off',
			'no-unassigned-vars': 'off',
			'no-unsafe-finally': 'off',
			'prefer-const': 'off',
		},
	},
	{
		// `component()` et `Slot` sont l'idiome fuma 1 « composant passé en valeur », que les
		// snippets de Svelte 5 remplacent. Ils ne survivent que le temps de convertir les
		// tables et les `InputRelation` qui les consomment, et leur signature est
		// irréductiblement générique: la typer finement serait du travail jeté.
		files: ['src/lib/ui/component.ts', 'src/lib/ui/slot/**'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
		},
	}
)
