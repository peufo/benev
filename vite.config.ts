import devtoolsJson from 'vite-plugin-devtools-json'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	test: {
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
	server: { fs: { allow: ['media'] }, allowedHosts: ['mac-de-jo.local'] },
	optimizeDeps: {
		include: ['litepicker'],
	},
})
