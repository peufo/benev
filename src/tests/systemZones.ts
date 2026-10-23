import { afterAll, beforeAll, describe } from 'vitest'

/**
 * Le fuseau de la machine qui exécute le code: le navigateur d'un·e organisateur·ice n'est pas
 * toujours dans celui de son évènement, et la CI tourne en UTC. New York et Auckland changent
 * d'heure à d'autres dates que l'Europe.
 */
const SYSTEM_ZONES = ['UTC', 'Europe/Zurich', 'America/New_York', 'Pacific/Auckland']

export function describeInSystemZones(name: string, suite: (zone: string) => void) {
	describe.each(SYSTEM_ZONES)(`${name} (machine en %s)`, (zone) => {
		const previous = process.env.TZ
		beforeAll(() => {
			process.env.TZ = zone
		})
		afterAll(() => {
			if (previous === undefined) delete process.env.TZ
			else process.env.TZ = previous
		})
		suite(zone)
	})
}
