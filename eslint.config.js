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
			// `any` reste toléré ponctuellement (interop avec des libs non typées):
			// avertissement, comme avant le passage à typescript-eslint 8.
			'@typescript-eslint/no-explicit-any': 'warn',
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
			// Idem: les `{#each}` sans clé existants sont à reprendre progressivement.
			'svelte/require-each-key': 'warn',
		},
	}
)
