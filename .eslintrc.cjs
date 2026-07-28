module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	rules: {
		// TypeScript résout lui-même les identifiants: `no-undef` ne voit pas les
		// constructions purement typées ($$Generic, `generics=` de Svelte, le
		// namespace global PrismaJson) et les signale à tort.
		// https://typescript-eslint.io/troubleshooting/faqs/eslint#i-get-errors-from-no-undef
		'no-undef': 'off',
		// Les déclarations de fonction dans un bloc sont standard en ESM (ES2015+),
		// et volontaires ici pour capturer les variables de boucle. Règle retirée
		// de eslint:recommended en ESLint 9.
		'no-inner-declarations': 'off',
		'svelte/no-inner-declarations': 'off',
		// `() => {}` sert de valeur par défaut aux props callback et de no-op de
		// nettoyage: c'est intentionnel, pas un oubli.
		'@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
	],
}
