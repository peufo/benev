import { describe, it } from 'vitest'
import { MAX_ATTEMPTS, RETRY_DELAYS, isPermanentError, nextDelay } from '$lib/server/emailRetry'

/**
 * La politique de réessai décide seule du sort d'un message: se tromper de côté coûte soit un
 * mail perdu qui aurait pu partir, soit quatre tentatives sur un refus définitif.
 */
describe('nextDelay', () => {
	it('espace les tentatives selon la table', ({ expect }) => {
		expect(nextDelay(1)).toBe(RETRY_DELAYS[0])
		expect(nextDelay(2)).toBe(RETRY_DELAYS[1])
		expect(nextDelay(3)).toBe(RETRY_DELAYS[2])
	})

	it('rend null quand les tentatives sont épuisées', ({ expect }) => {
		expect(nextDelay(MAX_ATTEMPTS)).toBe(null)
		expect(nextDelay(MAX_ATTEMPTS + 1)).toBe(null)
	})

	// Le compteur est incrémenté avant l'envoi: une tentative « zéro » n'existe pas.
	it('rend null pour un compteur incohérent', ({ expect }) => {
		expect(nextDelay(0)).toBe(null)
		expect(nextDelay(-1)).toBe(null)
	})

	it('offre bien un réessai de moins que de tentatives', ({ expect }) => {
		expect(MAX_ATTEMPTS).toBe(RETRY_DELAYS.length + 1)
	})
})

describe('isPermanentError', () => {
	it('tient un 5xx pour définitif', ({ expect }) => {
		expect(isPermanentError(Object.assign(new Error('No such user'), { responseCode: 550 }))).toBe(
			true
		)
		expect(
			isPermanentError(Object.assign(new Error('Message refusé'), { responseCode: 554 }))
		).toBe(true)
	})

	it('tient un 4xx pour passager', ({ expect }) => {
		expect(
			isPermanentError(Object.assign(new Error('Try again later'), { responseCode: 421 }))
		).toBe(false)
		expect(isPermanentError(Object.assign(new Error('Mailbox busy'), { responseCode: 450 }))).toBe(
			false
		)
	})

	// Une coupure réseau ou un délai dépassé n'a pas de code SMTP: c'est exactement le cas qu'il
	// faut réessayer, et l'ancien code le confondait avec un succès.
	it('tient une erreur sans code pour passagère', ({ expect }) => {
		expect(isPermanentError(new Error('ETIMEDOUT'))).toBe(false)
		expect(isPermanentError(Object.assign(new Error('socket'), { code: 'ECONNRESET' }))).toBe(false)
	})

	it('ne tombe pas sur une valeur non conforme', ({ expect }) => {
		expect(isPermanentError(null)).toBe(false)
		expect(isPermanentError(undefined)).toBe(false)
		expect(isPermanentError('550 boom')).toBe(false)
		expect(isPermanentError({ responseCode: '550' })).toBe(false)
	})
})
