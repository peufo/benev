import { sendEmailTemplate } from '$lib/server'
import { EmailProspect } from '$lib/email'

import { eventEmiter } from './eventEmitter'
import type { Prospect } from '@prisma/client'

export async function sendProspectEmails(prospects: Prospect[]) {
	for (const prospect of prospects) {
		await sendEmailTemplate(EmailProspect, {
			to: prospect.email,
			subject: 'Benev.io - Votre plateforme de gestion de bénévole',
			props: { appellation },
		})
		eventEmiter.emit('send_email', prospect)
		await wait(5000 + 3000 * Math.random())
	}
	return
}

function wait(ms: number) {
	return new Promise((reslove) => {
		setTimeout(reslove, ms)
	})
}
