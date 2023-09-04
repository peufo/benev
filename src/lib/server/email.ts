import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '$env/static/private'
import nodemailer from 'nodemailer'
import type { ComponentProps, ComponentType } from 'svelte'

export const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS,
	},
})

transporter.verify(function (err) {
	if (err) {
		console.log('Mail config error')
		console.error(err)
	} else {
		console.log('Mail config is ready')
	}
})

type MailOption = {
	/** Just expeditor name (whitout mail) */
	from?: string
	/** Email(s) of destinators */
	to: string | string[]
	/** Email title */
	subject: string
	/** Email content */
	html: string
}

export const sendEmail = async ({ from, ...mail }: MailOption) => {
	return new Promise((resolve) => {
		transporter.sendMail(
			{
				from: `${from || 'Benev'} <${SMTP_USER}>`,
				...mail,
			},
			(err, info) => {
				if (err) console.error(err)
				resolve(info)
			}
		)
	})
}

export async function sendEmailTemplate<Component extends ComponentType>(
	template: Component,
	options: Omit<MailOption, 'html'> & {
		props: ComponentProps<InstanceType<Component>>
	}
) {
	// @ts-ignore
	const { html } = template.render(options.props)
	return sendEmail({
		from: options.from,
		to: options.to,
		subject: options.subject,
		html,
	})
}
