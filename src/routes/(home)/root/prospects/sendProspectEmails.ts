import { sendEmailTemplate, prisma } from '$lib/server'
import { EmailProspect } from '$lib/email'

import { eventEmiter } from './eventEmitter'
import type { Prospect } from '@prisma/client'

export async function sendProspectEmails(prospects: Prospect[]) {
	for (const prospect of prospects) {
		await sendEmailTemplate(EmailProspect, {
			to: prospect.email,
			subject: 'Benev.io - Votre plateforme de gestion de bénévole',
			props: { prospect },
		})
		eventEmiter.emit('send_email', prospect)
		await prisma.prospect.update({ where: { id: prospect.id }, data: { lastContact: new Date() } })
	}
	return
}
