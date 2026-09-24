import { describe, it, expect } from 'vitest'
import { APP_VERSION, parseVersion } from '$lib/version'

describe('version', () => {
	// Le contrat tient entre deux fichiers: `svelte.config.js` compose la chaîne, `version.ts` la
	// redécoupe. Ce test échoue si l'un des deux change d'encodage sans l'autre.
	it('lit le nom composé par svelte.config.js', () => {
		expect(APP_VERSION.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
		expect(APP_VERSION.commit).toMatch(/^([0-9a-f]{7,}|dev)$/)
	})

	it('sépare la date du commit', () => {
		const { date, commit, hasSource } = parseVersion('2026-09-24_fa61385')
		expect(date).toBe('2026-09-24')
		expect(commit).toBe('fa61385')
		expect(hasSource).toBe(true)
	})

	it('ne revendique pas de source quand le commit est inconnu', () => {
		expect(parseVersion('2026-09-24_dev').hasSource).toBe(false)
	})
})
