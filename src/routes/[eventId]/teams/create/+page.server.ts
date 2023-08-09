import { teamShema } from '$lib/form/team'
import { parseFormData } from '$lib/server/formData'
import { isOwnerOrThrow, prisma } from '$lib/server'
import { redirect } from '@sveltejs/kit'

export const actions = {
	default: async ({ params, request, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		const { err, data } = await parseFormData(request, teamShema)
		if (err) return err

		const { leaders, ...restData } = data

		const team = await prisma.team.create({
			data: {
				...restData,
				eventId: params.eventId,
			},
		})

		if (leaders)
			await prisma.leader.createMany({
				data: leaders.connect.map(({ id }) => ({ userId: id, teamId: team.id })),
			})

		throw redirect(303, `/${params.eventId}/teams/${team.id}`)
	},
}
