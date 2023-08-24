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
	new_subscribe: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, subscribeShema)
		if (err) return err

		return tryOrFail(async () => {
			const subscribe = await prisma.subscribe.create({
				data,
				include: {
					member: { include: { user: true } },
					period: {
						include: {
							team: {
								include: {
									event: true,
									leaders: { select: { user: { select: { email: true } } } },
								},
							},
						},
					},
				},
			})

			if (subscribe.period.team.leaders.length)
				sendEmailTemplate(EmailNewSubscribe, {
					from: subscribe.period.team.event.name,
					to: subscribe.period.team.leaders.map(({ user }) => user.email),
					subject: 'Un nouveau bénévole',
					props: { subscribe },
				})
		})
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

		return tryOrFail(() =>
			prisma.period.create({
				data: {
					...data,
					teamId,
				},
			})
		)
	},
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
	delete_period: async ({ params, request, locals }) => {
		await isLeaderOrThrow(params.teamId, locals)
		const { id, err } = await getId(request)
		if (err) return err
		return tryOrFail(() => prisma.period.delete({ where: { id } }))
	},
	subscribe_accepted: async ({ params, request, locals }) => {
		await isLeaderOrThrow(params.teamId, locals)
		return await setSubscribState(request, 'accepted')
	},
	subscribe_denied: async ({ params, request, locals }) => {
		await isLeaderOrThrow(params.teamId, locals)
		return await setSubscribState(request, 'denied')
	},
}

async function setSubscribState(request: Request, state: SubscribeState) {
	const { id, err } = await getId(request)
	if (err) return err

	return tryOrFail(async () => {
		const subscribe = await prisma.subscribe.update({
			where: { id },
			data: { state },
			include: {
				member: { include: { user: { select: { email: true } } } },
				period: {
					include: {
						team: {
							include: { event: true, leaders: { select: { user: { select: { email: true } } } } },
						},
					},
				},
			},
		})

		sendEmailTemplate(EmailSubscribeState, {
			from: subscribe.period.team.event.name,
			to: subscribe.member.user.email,
			subject: `Inscription ${subscribe.state === 'accepted' ? 'confirmée' : 'refusée'}`,
			props: { subscribe },
		})
	})
}

async function getId(request: Request) {
	const data = await request.formData()
	const id = data.get('id')
	if (typeof id !== 'string') return { id: null, err: fail(400, { message: 'id is required' }) }
	return { id }
}
