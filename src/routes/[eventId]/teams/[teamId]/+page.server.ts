import { isLeaderOrThrow, parseFormData, prisma, sendEmailTemplate, tryOrFail } from '$lib/server'
import { periodShema, periodShemaUpdate, subscribeShema } from '$lib/form'
import { error, fail } from '@sveltejs/kit'

import { EmailNewSubscribe, EmailSubscribeState } from '$lib/email'
import type { SubscribeState } from '@prisma/client'

export const load = async ({ params, parent }) => {
	const { isLeader } = await parent()
	const { teamId } = params

	return {
		periods: await prisma.period.findMany({
			where: { teamId },
			orderBy: { start: 'asc' },
			include: {
				subscribes: isLeader ? { include: { member: { include: { user: true } } } } : true,
			},
		}),
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

		return tryOrFail(() =>
			prisma.period.create({
				data: {
					...data,
					teamId,
				},
			})
		)
	},
}
