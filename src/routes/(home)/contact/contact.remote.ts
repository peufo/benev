import { invalid } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { zStringNullable } from '$lib/models/form'
import { prisma, sendEmail, sendEmailComponent } from '$lib/server'
import { createRateLimit } from '$lib/server/rateLimit'
import { env } from '$env/dynamic/private'
import { EmailBasic } from '$lib/email'

const sendMessageSchema = z.object({
	subject: z.string().min(3).max(252),
	content: z.string().min(10).max(10_000),
	// Renseignés par les visiteurs sans compte uniquement: pour les autres, le compte fait foi.
	authorName: z.string().trim().max(120).optional(),
	authorEmail: zStringNullable(z.email().toLowerCase()),
	// Piège à robots: un champ invisible que seul un script remplit.
	contact_url_2: z.string().optional(),
})

/**
 * Le formulaire est public: une personne dont les données sont dans benevio sans y avoir de
 * compte doit pouvoir exercer ses droits. D'où la limite, et par adresse IP faute d'un compte
 * sur lequel s'appuyer.
 */
const isRateLimited = createRateLimit({ windowMs: 10 * 60_000, max: 1 })

export const sendMessage = form(sendMessageSchema, async (data, issue) => {
	const { locals, getClientAddress } = getRequestEvent()
	const session = await locals.auth.validate()

	// Rempli, donc rempli par un robot: on répond comme si de rien n'était plutôt que d'expliquer
	// le filtre à celui qui l'a déclenché.
	if (data.contact_url_2) return

	const author = session?.user ?? null
	const email = author?.email || data.authorEmail
	const name = author ? `${author.firstName} ${author.lastName}` : data.authorName

	if (!email) invalid(issue.authorEmail('Une adresse email est nécessaire pour te répondre'))
	if (!author && !name) invalid(issue.authorName('Indique ton nom'))
	if (isRateLimited(getClientAddress()))
		invalid(issue.content('Trop de messages envoyés. Réessaie dans quelques minutes.'))

	await Promise.all([
		prisma.message.create({
			data: {
				subject: data.subject,
				content: data.content,
				authorId: author?.userId ?? null,
				authorName: name,
				authorEmail: email,
			},
		}),
		sendEmail({
			from: `${name} depuis benevio`,
			to: [env.SMTP_USER, env.ROOT_USER],
			replyTo: email,
			subject: data.subject,
			text: data.content,
		}),
		sendEmailComponent(EmailBasic, {
			from: `Nouvelle prise de contact avec benevio`,
			to: email,
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
