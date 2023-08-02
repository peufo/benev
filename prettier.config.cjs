module.exports = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'es5',
	semi: false,
	printWidth: 100,
	pluginSearchDirs: ['.'],
	plugins: [require('prettier-plugin-svelte')],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
	tailwindConfig: './tailwind.config.cjs',
};
