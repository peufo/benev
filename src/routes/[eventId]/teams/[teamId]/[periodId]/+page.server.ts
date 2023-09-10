import { periodShemaUpdate } from '$lib/form'
import { isLeaderOrThrow, parseFormData, prisma, tryOrFail } from '$lib/server'

export const load = async ({ locals, params: { teamId, periodId } }) => {
	await isLeaderOrThrow(teamId, locals)
	return {
		period: await prisma.period.findUniqueOrThrow({
			where: { id: periodId },
			include: { team: true, subscribes: { include: { member: { include: { user: true } } } } },
		}),
	}
}

export const actions = {
	update_period: async ({ params, request, locals }) => {
		await isLeaderOrThrow(params.teamId, locals)
		const { err, data } = await parseFormData(request, periodShemaUpdate)
		if (err) return err

		return tryOrFail(() =>
			prisma.period.update({
				where: { id: data.id },
				data,
			})
		)
	},
	delete_period: async ({ params, locals }) => {
		await isLeaderOrThrow(params.teamId, locals)
		return tryOrFail(() => prisma.period.delete({ where: { id: params.periodId } }))
	},
}
