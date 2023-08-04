import { isLeader, isLeaderOrThrow, parseFormData, prisma } from '$lib/server'
import { periodShema } from '$lib/form'
import { fail } from '@sveltejs/kit'

export const load = async ({ params, locals }) => {
	const { teamId } = params

	return {
		isLeader: await isLeader(teamId, locals),
		team: await prisma.team.findUniqueOrThrow({
			where: { id: teamId },
			include: { leaders: true },
		}),
		periods: await prisma.period.findMany({ where: { teamId }, include: { subscribes: true } }),
	}
}

export const actions = {
	new_period: async ({ params, request, locals }) => {
		const { teamId } = params
		await isLeaderOrThrow(teamId, locals)

		const { err, data } = await parseFormData(request, periodShema)
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
				teamId,
			},
		})
		return
	},
}
