import { error, redirect } from '@sveltejs/kit'
import { memberShema } from '$lib/form'
import { parseFormData, prisma, tryOrFail } from '$lib/server'

export const load = async ({ locals, params }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(301, `/${params.eventId}/me?callback=/${params.eventId}/invite`)
}

export const actions = {
	new_member: async ({ request, locals, params }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, memberShema)
		if (err) return err

		const isValidedByUser = session.user.id === data.userId
		// TODO (invit_member ?) const isValidedByEvent = false
		// TODO: send mail to owner (optional)
		// TODO: send mail to new member

		return tryOrFail(() =>
			prisma.member.create({
				data: {
					...data,
					eventId: params.eventId,
					isValidedByUser,
				},
			})
		)
	},
}
