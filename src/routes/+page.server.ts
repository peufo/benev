import { error } from '@sveltejs/kit'
import { parseFormData } from '$lib/server'
import { eventShema } from '$lib/form'
import { prisma } from '$lib/server'

export const load = async () => {
	const events = await prisma.event.findMany()

	return { events }
}

export const actions = {
	new_event: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, eventShema)
		if (err) return err

		const event = await prisma.event.create({
			data: {
				...data,
				ownerId: session.user.userId,
			},
		})

		return { event }
	},
}
