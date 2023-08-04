import { teamShema } from '$lib/form/team'
import { parseFormData } from '$lib/server/formData'
import { isOwnerOrThrow, prisma } from '$lib/server'
import { redirect } from '@sveltejs/kit'

export const actions = {
	default: async ({ params, request, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

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
