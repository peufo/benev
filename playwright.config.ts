import type { PlaywrightTestConfig } from '@playwright/test'

const port = 4173

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'bun run build && bun run preview',
		port,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
		env: { EMAIL_DISABLED: 'true' },
	},
	use: { baseURL: `http://localhost:${port}` },
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? 'list' : 'html',
}

export default config
