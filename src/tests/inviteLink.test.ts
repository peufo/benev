import { describe, expect, it } from 'vitest'
import { ORIGIN } from '$app/env/public'
import { emailSuggestions, type EmailModelProps } from '$lib/pages/emailSuggesions'

/**
 * Tout le parcours d'invitation pend à cette URL: sans le jeton, la page de connexion ne sait plus
 * qui arrive, et l'invité retombe sur un formulaire vide dont il doit retrouver l'adresse exacte.
 */
describe("lien du mail d'invitation", () => {
	const acceptURL = emailSuggestions.invitation_create.find(({ id }) => id === 'acceptURL')

	it('mène à la page qui reconnaît le jeton', () => {
		const props = { tokenId: 'jeton-de-test' } as EmailModelProps['invitation_create']
		expect(acceptURL?.getValue(props)).toContain(`href="${ORIGIN}/token/jeton-de-test/invitation"`)
	})
})
