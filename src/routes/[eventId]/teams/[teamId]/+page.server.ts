import { isLeader, isLeaderOrThrow, parseFormData, prisma } from '$lib/server'
import { periodShema, periodShemaUpdate, subscribeShema } from '$lib/form'
import { error, fail } from '@sveltejs/kit'

export const load = async ({ params, locals }) => {
	const { teamId } = params

	const _isLeader = await isLeader(teamId, locals)

	return {
		isLeader: _isLeader,
		team: await prisma.team.findUniqueOrThrow({
			where: { id: teamId },
			include: { leaders: true },
		}),
		periods: await prisma.period.findMany({
			where: { teamId },
			include: { subscribes: _isLeader ? { include: { user: true } } : true },
		}),
	}
}

export const actions = {
	new_subscribe: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, subscribeShema)
		if (err) return err

		await prisma.subscribe.create({ data })

		return
	},
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
	update_period: async ({ params, request, locals }) => {
		await isLeaderOrThrow(params.teamId, locals)
		const { err, data } = await parseFormData(request, periodShemaUpdate)
		if (err) return err

		await prisma.period.update({
			where: { id: data.id },
			data,
		})

		return
	},
	delete_period: async ({ params, request, locals }) => {
		await isLeaderOrThrow(params.teamId, locals)

		const data = await request.formData()
		const id = data.get('id')
		if (typeof id !== 'string') return fail(400, { message: 'id is required' })

		await prisma.period.delete({ where: { id } })
		return
	},
}
