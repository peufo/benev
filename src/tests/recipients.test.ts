import { describe, expect, it } from 'vitest'
import { withoutTestRecipients } from '$lib/server/recipients'

/**
 * Le filtre est la dernière barrière avant un vrai envoi SMTP: une régression silencieuse
 * enverrait des mails aux comptes fabriqués par les tests.
 */
describe('withoutTestRecipients', () => {
	it('laisse passer une adresse ordinaire', () => {
		expect(withoutTestRecipients('bob@example.com')).toEqual({
			kept: ['bob@example.com'],
			dropped: [],
		})
	})

	it('écarte une adresse en .test', () => {
		expect(withoutTestRecipients('bob@benevio.test')).toEqual({
			kept: undefined,
			dropped: ['bob@benevio.test'],
		})
	})

	it('ne garde que les adresses livrables dans une liste', () => {
		const { kept, dropped } = withoutTestRecipients([
			'bob@benevio.test',
			'alice@example.com',
			{ name: 'Eve', address: 'eve@fixtures.test' },
		])
		expect(kept).toEqual(['alice@example.com'])
		expect(dropped).toEqual(['bob@benevio.test', 'eve@fixtures.test'])
	})

	it('lit l’adresse dans un « Nom <adresse> »', () => {
		expect(withoutTestRecipients('Bob The Tester <bob@benevio.test>').kept).toBeUndefined()
		expect(withoutTestRecipients('Bob <bob@example.com>').kept).toEqual(['Bob <bob@example.com>'])
	})

	it('découpe une chaîne à virgules', () => {
		const { kept, dropped } = withoutTestRecipients('bob@benevio.test, alice@example.com')
		expect(kept).toEqual(['alice@example.com'])
		expect(dropped).toEqual(['bob@benevio.test'])
	})

	it('ne se laisse pas berner par la casse ni les espaces', () => {
		expect(withoutTestRecipients('  BOB@Benevio.TEST  ').kept).toBeUndefined()
	})

	it('ne confond pas un domaine qui contient « test »', () => {
		expect(withoutTestRecipients('bob@test.com').kept).toEqual(['bob@test.com'])
		expect(withoutTestRecipients('bob@latest.org').kept).toEqual(['bob@latest.org'])
	})

	it('rend `undefined` sur une absence de destinataire', () => {
		expect(withoutTestRecipients(undefined)).toEqual({ kept: undefined, dropped: [] })
	})
})
