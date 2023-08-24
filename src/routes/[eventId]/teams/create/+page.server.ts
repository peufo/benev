import { teamShema } from '$lib/form/team'
import { parseFormData } from '$lib/server/formData'
import { isOwnerOrThrow, prisma, tryOrFail } from '$lib/server'

export const actions = {
	default: async ({ params, request, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		const { err, data } = await parseFormData(request, teamShema)
		if (err) return err

		return tryOrFail(
			() =>
				prisma.team.create({
					data: {
						...data,
						eventId: params.eventId,
					},
				}),
			(team) => `/${params.eventId}/teams/${team.id}`
		)
	},
}
