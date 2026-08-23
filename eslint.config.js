import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'
import svelteConfig from './svelte.config.js'

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
				svelteConfig,
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
		// `svelte/no-navigation-without-resolve` admet toute expression typée
		// `ResolvedPathname` ($app/types): c'est ce qui laisse passer `eventPath()` et
		// `urlParam.*` sans inliner `resolve()` à chaque appel. Le service de types n'est
		// branché que sur les fichiers couverts par tsconfig — les configs de la racine
		// n'appartiennent à aucun projet TS et le feraient échouer.
		files: ['src/**/*.{ts,js,svelte}', 'tests/**/*.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
			},
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
		},
	}
)
