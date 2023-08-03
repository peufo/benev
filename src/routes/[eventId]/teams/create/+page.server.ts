import { teamShema } from '$lib/form/team'
import { parseFormData } from '$lib/server/formData'
import { prisma } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'

export const actions = {
	default: async ({ params, request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		// check if is owner of event
		const { ownerId } = await prisma.event.findUniqueOrThrow({
			where: { id: params.eventId },
			select: { ownerId: true },
		})
		if (ownerId !== session.user.userId) throw error(401)

		const { err, data } = await parseFormData(request, teamShema)
		if (err) return err

		const team = await prisma.team.create({
			data: {
				...data,
				eventId: params.eventId,
			},
		})

		throw redirect(303, `/${params.eventId}/teams/${team.id}`)
	},
}
