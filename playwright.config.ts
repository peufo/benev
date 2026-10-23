import type { PlaywrightTestConfig } from '@playwright/test'

// Un worktree qui tourne à côté d'un autre choisit son port: `reuseExistingServer` reprendrait
// sinon le serveur du voisin, et testerait son code.
const port = Number(process.env.E2E_PORT ?? 4173)

const config: PlaywrightTestConfig = {
	webServer: {
		command: `bun run build && bun run preview --port ${port} --strictPort`,
		port,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
		// Le ticker est coupé: les tests déclenchent une tâche à la main depuis `/root/tasks`,
		// que `ROOT_USER` leur ouvre.
		env: { EMAIL_DISABLED: 'true', SCHEDULER_DISABLED: 'true', ROOT_USER: 'root@benevio.test' },
	},
	use: {
		baseURL: `http://localhost:${port}`,
		// Tiroirs, journal et connexion renoncent à leurs transitions sous cette préférence:
		// Playwright n'a plus à attendre qu'un élément s'immobilise ou finisse de sortir.
		contextOptions: { reducedMotion: 'reduce' },
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? 'list' : 'html',
}

export default config
