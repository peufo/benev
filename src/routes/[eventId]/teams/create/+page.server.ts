import { tryOrFail, parseFormData } from 'fuma/server'
import { modelTeam } from '$lib/models/team'
import { prisma, permission } from '$lib/server'

export const actions = {
	default: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)

		return tryOrFail(
			async () => {
				const { data, formData } = await parseFormData(request, modelTeam)

				const team = await prisma.team.create({
					data: {
						...data,
						eventId,
					},
				})
				const redirectTo = formData.get('redirectTo') as string | null
				return redirectTo || `/${eventId}/teams/${team.id}`
			},
			(redirectTo) => redirectTo
		)
	},
}
