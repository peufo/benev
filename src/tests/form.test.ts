import { describe, expect, test } from 'vitest'
import z from 'zod'
import { zStringNullable } from '$lib/models/form'

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
