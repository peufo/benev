import { error, redirect } from '@sveltejs/kit'
import { parseFormData, prisma } from '$lib/server'
import { userShema } from '$lib/form'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(300, '/auth')
	return {
		user: await prisma.user.findFirstOrThrow({
			where: { id: session.user.userId },
		}),
	}
}

export const actions = {
	default: async ({ locals, request }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401, { message: 'Non autorisé' })

		const { err, data } = await parseFormData(request, userShema)
		if (err) return err

		await prisma.user.update({
			where: { id: session.user.userId },
			data,
		})
	},
}
