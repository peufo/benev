import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [sveltekit()],
	base: 'https://benev.io',
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
	server: {
		fs: {
			allow: ['media'],
		},
	},
})
