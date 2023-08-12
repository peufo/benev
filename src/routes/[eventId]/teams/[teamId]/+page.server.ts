import { isLeaderOrThrow, parseFormData, prisma, sendEmailTemplate } from '$lib/server'
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
			include: { subscribes: isLeader ? { include: { user: true } } : true },
		}),
	}
}

export const actions = {
	new_subscribe: async ({ request, locals }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, subscribeShema)
		if (err) return err

		const subscribe = await prisma.subscribe.create({
			data,
			include: {
				user: true,
				period: {
					include: {
						team: {
							include: { event: true, leaders: { select: { user: { select: { email: true } } } } },
						},
					},
				},
			},
		})

		sendEmailTemplate(EmailNewSubscribe, {
			to: subscribe.period.team.leaders.map(({ user }) => user.email),
			subject: 'Un nouveau bénévole',
			props: { subscribe },
		})

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
		const { id, err } = await getId(request)
		if (err) return err
		await prisma.period.delete({ where: { id } })
		return
	},
	subscribe_accepted: async ({ params, request, locals }) => {
		await isLeaderOrThrow(params.teamId, locals)
		await setSubscribState(request, 'accepted')
		return
	},
	subscribe_denied: async ({ params, request, locals }) => {
		await isLeaderOrThrow(params.teamId, locals)
		await setSubscribState(request, 'denied')
		return
	},
}

async function setSubscribState(request: Request, state: SubscribeState) {
	const { id, err } = await getId(request)
	if (err) return err
	const subscribe = await prisma.subscribe.update({
		where: { id },
		data: { state },
		include: {
			user: { select: { email: true } },
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
		to: subscribe.user.email,
		subject: `Inscription ${subscribe.state === 'accepted' ? 'acceptée' : 'refusée'}`,
		props: { subscribe },
	})

	return
}

async function getId(request: Request) {
	const data = await request.formData()
	const id = data.get('id')
	if (typeof id !== 'string') return { id: null, err: fail(400, { message: 'id is required' }) }
	return { id }
}
