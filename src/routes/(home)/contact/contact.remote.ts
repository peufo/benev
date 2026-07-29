import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { prisma, sendEmail, sendEmailComponent } from '$lib/server'
import { env } from '$env/dynamic/private'
import { EmailBasic } from '$lib/email'

const sendMessageSchema = z.object({
	subject: z.string().min(3).max(252),
	content: z.string().min(10).max(10_000),
})

export const sendMessage = form(sendMessageSchema, async (data) => {
	const { locals } = getRequestEvent()
	const session = await locals.auth.validate()
	if (!session) error(403)

	await Promise.all([
		prisma.message.create({
			data: {
				...data,
				authorId: session.user.id,
			},
		}),
		sendEmail({
			from: `${session.user.firstName} ${session.user.lastName} depuis benevio`,
			to: [env.SMTP_USER, env.ROOT_USER],
			replyTo: session.user.email,
			subject: data.subject,
			text: data.content,
		}),
		sendEmailComponent(EmailBasic, {
			from: `Nouvelle prise de contact avec benevio`,
			to: session.user.email,
			subject: `Prise de contact avec benevio`,
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
