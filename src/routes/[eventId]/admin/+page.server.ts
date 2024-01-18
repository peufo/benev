import { redirect } from '@sveltejs/kit'
import { tryOrFail, prisma, parseFormData, permission } from '$lib/server'
import { viewCreate } from '$lib/validation'

export const load = async ({ url }) => {
	redirect(302, `${url.pathname}/members`)
}

export const actions = {
	create_view: async ({ request, locals, params: { eventId } }) => {
		const member = await permission.leader(eventId, locals)
		const { err, data } = await parseFormData(request, viewCreate)
		if (err) return err
		return tryOrFail(() =>
			prisma.view.create({
				data: {
					...data,
					eventId,
					authorId: member.id,
				},
			})
		)
	},
}
