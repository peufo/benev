import { defineConfig } from 'cademo'
import playwright from './playwright.config'

/** Les vidéos de démo de la landing (`src/lib/landing/Workflow.svelte`), filmées par cademo. */
export default defineConfig({
	demos: 'demos',
	// Hors du dépôt: `bun run demo:publish` la dépose dans `MEDIA_DIR/demos`.
	output: 'demos/.out/videos',
	workDir: 'demos/.out',
	// Même serveur que la suite de tests.
	webServer: playwright.webServer,
	baseURL: playwright.use?.baseURL,
	locale: 'fr-CH',
	timezoneId: 'Europe/Zurich',
	render: { displayOrigin: 'https://benev.io' },
})
