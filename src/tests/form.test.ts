import { describe, expect, test } from 'vitest'
import z from 'zod'
import { zSetOptional, zStringNullable } from '#lib/models/form.js'

describe('zStringNullable', () => {
	const email = zStringNullable(z.email().toLowerCase())

	test("trime l'adresse avant d'en vérifier le format", () => {
		expect(email.parse(' Jonas@Example.ch ')).toBe('jonas@example.ch')
	})

	test('les trois états de la mise à jour', () => {
		expect(email.parse(undefined)).toBeUndefined()
		expect(email.parse('')).toBeNull()
		expect(email.parse('   ')).toBeNull()
	})

	test('refuse toujours une adresse malformée', () => {
		expect(email.safeParse('pas une adresse').success).toBe(false)
	})
})

describe('zSetOptional', () => {
	test('une clé absente reste absente, au lieu de vider la relation', () => {
		expect(zSetOptional.parse(undefined)).toBeUndefined()
	})

	test('une liste transmise remplace la relation, vide comprise', () => {
		expect(zSetOptional.parse(['a', 'b'])).toEqual({ set: [{ id: 'a' }, { id: 'b' }] })
		expect(zSetOptional.parse([])).toEqual({ set: [] })
	})
})
