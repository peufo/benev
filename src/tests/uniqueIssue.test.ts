import { describe, expect, it } from 'vitest'
import { Prisma } from '@prisma/client'
import { isValidationError } from '@sveltejs/kit'
import { isUniqueConstraintError, uniqueIssue } from '$lib/server/uniqueIssue'

/**
 * Le filtre par champ repose sur le nom que MySQL donne à ses index — `Modèle_champ_key` —
 * transmis tel quel par Prisma. Un changement de format ferait blâmer le mauvais champ, ou
 * laisserait repasser un 500: c'est ce contrat-là que le test fige.
 */
function uniqueError(target: string) {
	return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
		code: 'P2002',
		clientVersion: Prisma.prismaVersion.client,
		meta: { target },
	})
}

describe('isUniqueConstraintError', () => {
	it('reconnaît une violation d’unicité', () => {
		expect(isUniqueConstraintError(uniqueError('Team_name_eventId_key'))).toBe(true)
	})

	it('distingue deux contraintes du même modèle par leur champ', () => {
		const err = uniqueError('Member_email_eventId_key')
		expect(isUniqueConstraintError(err, 'email')).toBe(true)
		expect(isUniqueConstraintError(err, 'userId')).toBe(false)
	})

	it('ignore les autres erreurs Prisma et tout le reste', () => {
		const notFound = new Prisma.PrismaClientKnownRequestError('Not found', {
			code: 'P2025',
			clientVersion: Prisma.prismaVersion.client,
		})
		expect(isUniqueConstraintError(notFound)).toBe(false)
		expect(isUniqueConstraintError(new Error('boom'))).toBe(false)
		expect(isUniqueConstraintError(undefined)).toBe(false)
	})
})

describe('uniqueIssue', () => {
	it('transforme la violation en erreur de validation', () => {
		try {
			uniqueIssue('Ce nom est déjà pris')(uniqueError('Team_name_eventId_key'))
			expect.unreachable()
		} catch (err) {
			expect(isValidationError(err)).toBe(true)
		}
	})

	it('laisse repasser ce qui n’est pas une violation d’unicité', () => {
		const other = new Error('boom')
		expect(() => uniqueIssue('Ce nom est déjà pris')(other)).toThrow(other)
	})
})
