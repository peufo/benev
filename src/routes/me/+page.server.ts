import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { auth, parseFormData } from '$lib/server'
import { loginShema, registerShema } from '$lib/form'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (session) throw redirect(301, '/me/subscribes')
}

export const actions: Actions = {
	register: async ({ request, locals }) => {
		const { err, data } = await parseFormData(request, registerShema)
		if (err) return err

		const attributes = {
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone,
		}

		try {
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

			// if (typeof formData.callback === 'string') throw redirect(300, formData.callback)
		} catch (error) {
			const { message } = error as Error
			console.log(error)
			return fail(400, { message })
		}
	},

	login: async ({ request, locals }) => {
		const { err, data, formData } = await parseFormData(request, loginShema)
		if (err) return err
		try {
			const user = await auth.useKey('email', data.email, data.password)
			const session = await auth.createSession({ userId: user.userId, attributes: {} })
			locals.auth.setSession(session)
		} catch (error) {
			const { message } = error as Error
			console.error(error)
			return fail(400, { message })
		}

		// if (typeof formData.callback === 'string') throw redirect(300, formData.callback)
	},

	logout: async ({ locals }) => {
		const session = await locals.auth.validate()
		if (!session) return fail(401)
		await auth.invalidateSession(session.sessionId)
		locals.auth.setSession(null) // remove cookie
	},
}