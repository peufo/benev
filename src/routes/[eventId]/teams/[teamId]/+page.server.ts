import { isOwnerOrLeader, parseFormData, prisma } from '$lib/server'
import { periodShema } from '$lib/form'
import { fail } from '@sveltejs/kit'

export const load = async ({ params }) => {
	const { teamId } = params

	return {
		team: prisma.team.findUniqueOrThrow({ where: { id: teamId } }),
		periods: prisma.period.findMany({ where: { teamId }, include: { subscribes: true } }),
	}
}

export const actions = {
	new_period: async ({ params, request, locals }) => {
		await isOwnerOrLeader(params.teamId, locals)

		const { err, data } = await parseFormData(request, periodShema)
		console.log(err?.data)
		if (err) return err

		if (data.start.getTime() > data.end.getTime()) {
			return fail(400, {
				issues: [
					{ path: ['start'], message: 'Doit être avant la fin' },
					{ path: ['end'], message: 'Doit être après le début' },
				],
			})
		}

		await prisma.period.create({
			data: {
				...data,
				teamId: params.teamId,
			},
		})
		return
	},
}
