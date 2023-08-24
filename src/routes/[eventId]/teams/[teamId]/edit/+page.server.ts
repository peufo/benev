import { teamShema } from '$lib/form/team'
import { parseFormData } from '$lib/server/formData'
import { isOwnerOrThrow, prisma, tryOrFail } from '$lib/server'

export const load = async ({ params, locals }) => {
	await isOwnerOrThrow(params.eventId, locals)
}

export const actions = {
	update: async ({ params, request, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)
		const { err, data } = await parseFormData(request, teamShema, { arrayOperation: 'set' })
		if (err) return err

		return tryOrFail(
			() =>
				prisma.team.update({
					where: { id: params.teamId },
					data,
				}),
			`/${params.eventId}/teams`
		)
	},
	delete: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)
		return tryOrFail(
			() =>
				prisma.team.delete({
					where: { id: params.teamId },
				}),
			`/${params.eventId}/teams`
		)
	},
}
