import { fail, redirect } from '@sveltejs/kit'
import {
	auth,
	generateToken,
	parseFormData,
	prisma,
	sendEmailTemplate,
	tryOrFail,
} from '$lib/server'
import { loginShema, passwordResetShema, registerShema } from '$lib/form'
import { EmailVerificationLink, EmailPasswordReset } from '$lib/email'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (session) throw redirect(301, '/me/subscribes')
}

export const actions = {
	register: async ({ request, locals }) => {
		const { err, data } = await parseFormData(request, registerShema)
		if (err) return err

		const attributes = {
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone,
			isEmailVerified: false,
		}
		return tryOrFail(async () => {
			const user = await auth.createUser({
				key: {
					providerId: 'email',
					providerUserId: data.email,
					password: data.password,
				},
				attributes,
			})
			const session = await auth.createSession({ userId: user.userId, attributes: {} })
			locals.auth.setSession(session)

			const tokenId = await generateToken('emailVerification', session.user.id)
			sendEmailTemplate(EmailVerificationLink, {
				to: session.user.email,
				subject: 'Bienvenue',
				props: {
					isNewUser: true,
					tokenId,
				},
			})
		})
	},

	login: async ({ request, locals }) => {
		console.log('LOGIN')
		const { err, data } = await parseFormData(request, loginShema)
		if (err) return err
		return tryOrFail(async () => {
			const user = await auth.useKey('email', data.email, data.password)
			const session = await auth.createSession({ userId: user.userId, attributes: {} })
			locals.auth.setSession(session)
		})
	},

	logout: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) return fail(401)
		await auth.invalidateSession(session.sessionId)
		locals.auth.setSession(null) // remove cookie
	},

	verify_email: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) return fail(401)
		const tokenId = await generateToken('emailVerification', session.user.id)
		await sendEmailTemplate(EmailVerificationLink, {
			to: session.user.email,
			subject: 'Verification de ton Email',
			props: { tokenId },
		})
	},
	reset_password: async ({ request }) => {
		const { err, data } = await parseFormData(request, passwordResetShema)
		if (err) return err
		return tryOrFail(async () => {
			const user = await prisma.user.findUniqueOrThrow({
				where: { email: data.email },
				select: { id: true },
			})
			const tokenId = await generateToken('passwordReset', user.id)
			await sendEmailTemplate(EmailPasswordReset, {
				to: data.email,
				subject: 'Changement de mot de passe',
				props: { tokenId },
			})
		})
	},
}
