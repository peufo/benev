/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,svelte,ts,js}', './node_modules/**/fuma/dist/**/*.svelte'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Barlow', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
			},
			colors: {
				brand: {
					beige: '#c7b198',
				},
			},
		},
	},
	plugins: [
		require('daisyui'),
		require('@tailwindcss/typography'),
		require('@tailwindcss/container-queries'),
	],
	daisyui: {
		logs: false,
		themes: [
			{
				light: {
					...require('daisyui/src/theming/themes')['[data-theme=light]'],
					primary: '#0d3b66',
					secondary: '#e41e66',
				},
			},
		],
	},
}
