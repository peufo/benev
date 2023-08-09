import { teamShema } from '$lib/form/team'
import { parseFormData } from '$lib/server/formData'
import { isOwnerOrThrow, prisma } from '$lib/server'
import { redirect } from '@sveltejs/kit'

export const load = async ({ params, locals }) => {
	await isOwnerOrThrow(params.eventId, locals)
}

export const actions = {
	update: async ({ params, request, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)
		const { err, data } = await parseFormData(request, teamShema)
		if (err) return err

		const { teamId } = params
		const { leaders, ...restData } = data
		const leadersId = leaders?.connect.map(({ id }) => id) || []

		await prisma.team.update({
			where: { id: params.teamId },
			data: {
				...restData,
				...(leaders && {
					leaders: {
						deleteMany: {
							teamId,
							userId: { notIn: leadersId },
						},
						createMany: {
							data: leadersId.map((id) => ({ userId: id })),
							skipDuplicates: true,
						},
					},
				}),
			},
		})

		throw redirect(303, `/${params.eventId}/teams`)
	},
	delete: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)
		await prisma.team.delete({
			where: { id: params.teamId },
		})
		throw redirect(303, `/${params.eventId}/teams`)
	},
}
