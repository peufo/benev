import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '$env/static/private'
import nodemailer, { type SendMailOptions } from 'nodemailer'
import type { ComponentProps, ComponentType } from 'svelte'
import { prisma } from './prisma'

export const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS,
	},
})

transporter.verify((err: unknown) => {
	if (err) {
		console.log('Mail config error')
		console.error(err)
	} else {
		console.log('Mail config is ready')
	}
})

export const sendEmail = async ({ from, ...options }: SendMailOptions) => {
	return new Promise((resolve) => {
		transporter.sendMail(
			{
				from: `${from || 'Benev'} <${SMTP_USER}>`,
				...options,
			},
			(err: unknown, info: unknown) => {
				if (err) console.error(err)
				resolve(info)
			}
		)
	})
}

export async function sendEmailTemplate<Component extends ComponentType>(
	template: Component,
	options: Omit<SendMailOptions, 'html'> & {
		props: ComponentProps<InstanceType<Component>>
	}
) {
	// @ts-ignore
	const { html } = template.render(options.props)
	return sendEmail({
		...options,
		html,
	})
}

export async function generateEmail() {
	const userCount = await prisma.user.count()
	return `guest-${userCount + 1}@benev.io`
}
