import { describe, expect, it, vi } from 'vitest'
import { isShuttingDown, runInBackground, settleBackground } from '#lib/server/background.js'

describe('runInBackground', () => {
	it("laisse finir à l'arrêt ce qui tournait, et prévient les boucles", async () => {
		const seen: boolean[] = []
		let release = () => {}
		runInBackground('lent', async () => {
			await new Promise<void>((resolve) => (release = resolve))
			seen.push(isShuttingDown())
		})
		const failing = vi.spyOn(console, 'error').mockImplementation(() => {})
		runInBackground('en échec', async () => {
			throw new Error('boum')
		})

		const settled = settleBackground()
		expect(isShuttingDown()).toBe(true)
		release()
		await settled
		expect(seen).toEqual([true])
		expect(failing).toHaveBeenCalledWith('[background] en échec', expect.any(Error))
	})
})
