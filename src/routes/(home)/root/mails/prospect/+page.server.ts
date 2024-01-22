import { tryOrFail, sendEmailTemplate, parseFormData } from '$lib/server'
import { EmailProspect } from '$lib/email'
import { z } from '$lib/validation'

export const actions = {
	send_email: async ({ request }) => {
		const { err, data } = await parseFormData(request, { to: z.string().email() })
		if (err) return err

		return tryOrFail(() => {
			return sendEmailTemplate(EmailProspect, {
				to: data.to,
				subject: 'Benev.io - Votre plateforme de gestion de bénévole',
				props: {},
			})
		})
	},
}
