import { teamCreate } from '$lib/validation/models/team'
import { parseFormData } from '$lib/server/formData'
import { prisma, tryOrFail, permission } from '$lib/server'

export const actions = {
	default: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)

		const { err, data, formData } = await parseFormData(request, teamCreate)
		if (err) return err

		return tryOrFail(
			() =>
				prisma.team.create({
					data: {
						...data,
						eventId,
					},
				}),
			(team) => {
				const redirectTo = formData.get('redirectTo') as string
				return redirectTo || `/${eventId}/teams/${team.id}`
			}
		)
	},
}
