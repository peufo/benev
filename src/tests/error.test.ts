import { describe, expect, it } from 'vitest'
import { error } from '@sveltejs/kit'
import { defaultErrorMessage, errorCode, errorMessage, normalizeCaughtError } from '#lib/error.js'

/** Rattrape ce que lève `error()`, comme le client le reçoit d'une fonction distante. */
function caught(raise: () => never): unknown {
	try {
		raise()
	} catch (err) {
		return err
	}
}

describe('defaultErrorMessage', () => {
	it('donne un message français aux statuts courants', () => {
		expect(defaultErrorMessage(400)).toBe("Cette demande n'est pas valide")
		expect(defaultErrorMessage(401)).toBe('Connecte-toi pour continuer')
		expect(defaultErrorMessage(403)).toBe("Tu n'as pas les droits pour faire ça")
		expect(defaultErrorMessage(404)).toBe('Page introuvable')
		expect(defaultErrorMessage(429)).toBe('Trop de demandes, réessaie dans quelques minutes')
	})

	it('retombe sur un message générique pour le reste', () => {
		expect(defaultErrorMessage(500)).toBe('Une erreur est survenue')
		expect(defaultErrorMessage(418)).toBe('Une erreur est survenue')
	})
})

describe('errorMessage', () => {
	it('lit le message écrit par le serveur', () => {
		const err = caught(() => error(403, 'Ce créneau est complet'))
		expect(errorMessage(err, 'repli')).toBe('Ce créneau est complet')
	})

	it("remplace le message d'un error() sans texte", () => {
		const err = caught(() => error(403))
		expect(errorMessage(err)).toBe("Tu n'as pas les droits pour faire ça")
	})

	it("préfère le repli du composant pour une 5xx ou ce qui n'est pas un HttpError", () => {
		expect(
			errorMessage(
				caught(() => error(500, 'Internal Error')),
				'repli'
			)
		).toBe('repli')
		expect(errorMessage(new Error('Failed to fetch'), 'repli')).toBe('repli')
		expect(errorMessage('texte')).toBe('Une erreur est survenue')
	})
})

describe('errorCode', () => {
	it('lit le code porté par le corps', () => {
		const err = caught(() =>
			error(401, 'Email ou mot de passe incorrect', { code: 'invalid_credentials' })
		)
		expect(errorCode(err)).toBe('invalid_credentials')
	})

	it("ne trouve rien sans code, ni hors d'un HttpError", () => {
		expect(errorCode(caught(() => error(403, 'Refusé')))).toBeUndefined()
		expect(errorCode(new Error('invalid_credentials'))).toBeUndefined()
	})
})

describe('normalizeCaughtError', () => {
	it("garde le message et le code d'une erreur de l'app", () => {
		const body = { status: 403, message: 'Ce créneau est complet' }
		expect(normalizeCaughtError({ kind: 'app', error: body })).toBeUndefined()
	})

	it('traduit un error() sans texte, une erreur du framework et une validation', () => {
		const bare = { status: 403, message: 'Error: 403' }
		expect(normalizeCaughtError({ kind: 'app', error: bare })?.message).toBe(
			"Tu n'as pas les droits pour faire ça"
		)
		const notFound = { status: 404, message: 'Not Found' }
		expect(normalizeCaughtError({ kind: 'framework', error: notFound })?.message).toBe(
			'Page introuvable'
		)
		const invalid = { status: 400, message: 'Bad Request' }
		expect(normalizeCaughtError({ kind: 'validation', error: invalid })?.message).toBe(
			"Cette demande n'est pas valide"
		)
	})

	it("ne laisse rien filer d'une erreur imprévue", () => {
		const prisma = new Error('Invalid `prisma.member.findFirstOrThrow()` invocation')
		expect(normalizeCaughtError({ kind: 'unknown', error: prisma })).toEqual({
			message: 'Une erreur est survenue',
		})
	})
})
