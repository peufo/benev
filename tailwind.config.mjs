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
					'beige-dark': '#b8a58a',
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
					'color-scheme': 'light',
					primary: '#0d3b66',
					'primary-content': '#E0D2FE',
					secondary: '#e41e66',
					'secondary-content': '#FFD1F4',
					accent: '#1ECEBC',
					'accent-content': '#07312D',
					neutral: '#2B3440',
					'neutral-content': '#D7DDE4',
					'base-100': '#ffffff',
					'base-200': '#F2F2F2',
					'base-300': '#E5E6E6',
					'base-content': '#1f2937',
				},
			},
		],
	},
}
