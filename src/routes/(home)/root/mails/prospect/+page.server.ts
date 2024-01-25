import { tryOrFail, sendEmailTemplate, parseFormData } from '$lib/server'
import { EmailProspect } from '$lib/email'
import { z } from '$lib/validation'
import { eventEmiter } from './eventEmitter'

export const actions = {
	send_email: async ({ request }) => {
		const { err, data } = await parseFormData(request, { to: z.string() })
		if (err) return err

		return tryOrFail(async () => {
			const emails = data.to.split('\n')

			for (const email of emails) {
				const [to, appellation] = email.split('\t')

				await sendEmailTemplate(EmailProspect, {
					to,
					subject: 'Benev.io - Votre plateforme de gestion de bénévole',
					props: { appellation },
				})
				eventEmiter.emit('send_email', email)
				await wait(5000 + 3000 * Math.random())
			}
			return
		})
	},
}

function wait(ms: number) {
	return new Promise((reslove) => {
		setTimeout(reslove, ms)
	})
}
