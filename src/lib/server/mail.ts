import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '$env/static/private'
import nodemailer from 'nodemailer'

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
	to: string | string[]
	subject: string
	html: string
}

export const sendMail = async (mail: MailOption) => {
	return new Promise((resolve) => {
		transporter.sendMail(
			{
				from: `BENEV <${SMTP_USER}>`,
				...mail,
			},
			(err, info) => {
				if (err) {
					console.error(err)
				}
				resolve(info)
			}
		)
	})
}
