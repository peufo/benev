import { error } from '@sveltejs/kit'
import { tryOrFail } from 'fuma/server'
import {
	getUserIdOrRedirect,
	parseFormData,
	prisma,
	sendEmail,
	sendEmailComponent,
} from '$lib/server'
import { z } from '$lib/validation'
import { SMTP_USER, ROOT_USER } from '$env/static/private'
import { EmailBasic } from '$lib/email'

export const load = async ({ url, locals }) => {
	const userId = await getUserIdOrRedirect(url, locals)
	return {
		messages: await prisma.message.findMany({ where: { authorId: userId } }),
	}
}

export const actions = {
	new_message: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) error(403)
		const { data, err } = await parseFormData(request, {
			subject: z.string().min(3).max(252),
			content: z.string().min(10).max(10_000),
		})
		if (err) return err

		return tryOrFail(async () => {
			await Promise.all([
				prisma.message.create({
					data: {
						...data,
						authorId: session.user.id,
					},
				}),
				sendEmail({
					from: `${session.user.firstName} ${session.user.lastName} depuis benev.io`,
					to: [SMTP_USER, ROOT_USER],
					replyTo: session.user.email,
					subject: data.subject,
					text: data.content,
				}),
				sendEmailComponent(EmailBasic, {
					from: `Nouvelle prise de contact avec benev.io`,
					to: session.user.email,
					subject: `Prise de contact avec benev.io`,
					props: {
						title: `Prise de contact`,
						subtitle: data.subject,
						content: `
              <p>Nous avons bien reçu ta demande et nous y répondra aussi vite que possible.</p>
              <p style="border: solid 1px grey; border-radius: 4px; padding: 14px;">
                ${data.content.replaceAll('\n', '<br/>')}
              </p>
            `,
					},
				}),
			])
		})
	},
}
