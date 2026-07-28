import { env } from '$env/dynamic/private'
import nodemailer, { type SendMailOptions } from 'nodemailer'
import type { ComponentProps, ComponentType } from 'svelte'
import { prisma } from '$lib/server'
import type { EmailEvent } from '$lib/email/models'
import { emailReplacers, type EmailModelProps } from '$lib/pages/emailSuggesions'
import { injectValues } from '$lib/pages/injectValues'
import { tiptapParser } from 'fuma'
import EmailLayout from '$lib/email/EmailLayout.svelte'
import { getMemberReplacers } from '$lib/pages/memberSuggestions'
import { domain } from '$lib/email'

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: Number(env.SMTP_PORT),
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
	},
})

/**
 * Les tests créent des comptes sur des adresses inexistantes: sans ce garde-fou,
 * une machine dotée d'un SMTP valide leur enverrait de vrais mails (et collectionnerait
 * les bounces). Positionné par la CI et par le webServer Playwright.
 */
const emailDisabled = env.EMAIL_DISABLED === 'true'

let transporterOK = false
if (emailDisabled) {
	console.log('Mail disabled (EMAIL_DISABLED=true)')
} else {
	transporter.verify((err: unknown) => {
		if (err) {
			console.log('Mail config error')
			console.error(err)
		} else {
			transporterOK = true
			console.log('Mail config is ready')
		}
	})
}

export const sendEmail = async ({ from, ...options }: SendMailOptions) => {
	if (!transporterOK) return
	return new Promise((resolve) => {
		transporter.sendMail(
			{
				from: `${from || 'Benev.io'} <${env.SMTP_USER}>`,
				...options,
			},
			(err: unknown, info: unknown) => {
				if (err) console.error(err)
				resolve(info)
			}
		)
	})
}

export type SendMailOptionsWithProps<Props> = Omit<SendMailOptions, 'html'> & {
	props: Props
}

export async function sendEmailComponent<Component extends ComponentType>(
	component: Component,
	options: SendMailOptionsWithProps<ComponentProps<InstanceType<Component>>>
) {
	// @ts-expect-error `render` est ajouté au composant par la compilation SSR de Svelte, absent du type ComponentType
	const { html } = component.render(options.props)
	return sendEmail({ ...options, html })
}

export async function sendEmailModel<EmailPath extends EmailEvent>(
	eventId: string,
	emailPath: EmailPath,
	options: SendMailOptionsWithProps<EmailModelProps[EmailPath]>
) {
	const html = await renderEmailModel(eventId, emailPath, options.props)
	return sendEmail({
		...options,
		html,
	})
}

export async function renderEmailModel<EmailPath extends EmailEvent>(
	eventId: string,
	emailPath: EmailPath,
	props: EmailModelProps[EmailPath]
) {
	const model = await prisma.page.findUniqueOrThrow({
		where: { eventId_path: { eventId, path: emailPath } },
		include: { event: true },
	})

	const replacers = [...emailReplacers[emailPath](props), ...getMemberReplacers(props)]
	const modelHTML = tiptapParser.toHTML(model.content)
	// @ts-expect-error `render` est ajouté au composant par la compilation SSR de Svelte, absent du type importé
	const layout = EmailLayout.render({ title: model.event.name, subtitle: model.title }) as {
		html: string
	}
	const html = layout.html.replace('__SLOT__', injectValues(modelHTML, replacers))
	return injectDomain(html)
}

function injectDomain(html: string): string {
	return html.replaceAll(/(<[^>]*)src="\//g, `$1src="${domain}/`)
}
