import { error, redirect } from '@sveltejs/kit'
import { parseFormData, prisma, tryOrFail } from '$lib/server'
import { userShema } from '$lib/form'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(300, '/me')
	return {
		user: await prisma.user.findFirstOrThrow({
			where: { id: session.user.userId },
		}),
	}
}

export const actions = {
	default: async ({ locals, request }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, userShema)
		if (err) return err
		return tryOrFail(() =>
			prisma.user.update({
				where: { id: session.user.userId },
				data,
			})
		)
	},
}
