/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,svelte,ts,js}'],
	theme: {
		extend: {},
	},
	plugins: [
		require('daisyui'),
		require('@tailwindcss/typography'),
		require('@tailwindcss/container-queries'),
	],
	daisyui: {
		themes: [
			'dark',
			/*
			{
				light: {
					...require('daisyui/src/theming/themes')['[data-theme=light]'],
					secondary: '#e41e66',
				},
			},
			*/
		],
	},
}
