import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '$env/static/private'
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

export const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS,
	},
})

let transporterOK = false
transporter.verify((err: unknown) => {
	if (err) {
		console.log('Mail config error')
		console.error(err)
	} else {
		transporterOK = true
		console.log('Mail config is ready')
	}
})

export const sendEmail = async ({ from, ...options }: SendMailOptions) => {
	if (!transporterOK) return
	return new Promise((resolve) => {
		transporter.sendMail(
			{
				from: `${from || 'Benev.io'} <${SMTP_USER}>`,
				...options,
			},
			(err: unknown, info: unknown) => {
				if (err) console.error(err)
				resolve(info)
			}
		)
	})
}

export type SendMailOptionsWithProps<Props extends any> = Omit<SendMailOptions, 'html'> & {
	props: Props
}

export async function sendEmailComponent<Component extends ComponentType>(
	component: Component,
	options: SendMailOptionsWithProps<ComponentProps<InstanceType<Component>>>
) {
	// @ts-ignore
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
	// @ts-ignore
	const layout = EmailLayout.render({ title: model.event.name, subtitle: model.title }) as {
		html: string
	}
	const html = layout.html.replace('__SLOT__', injectValues(modelHTML, replacers))
	return injectDomain(html)
}

export async function generateEmail() {
	const userCount = await prisma.user.count()
	return `guest-${userCount + 1}@benev.io`
}

function injectDomain(html: string): string {
	return html.replaceAll(/(<[^>]*)src="\//g, `$1src="${domain}/`)
}
