import { error } from '@sveltejs/kit'
import { isFreeRange } from 'perod'
import { subscribeShema } from '$lib/form'
import { isLeader, parseFormData, prisma, sendEmailTemplate, tryOrFail } from '$lib/server'
import { EmailNewSubscribe } from '$lib/email'

export const actions = {
	new_subscribe: async ({ request, locals, params: { eventId } }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, subscribeShema)
		if (err) return err

		return tryOrFail(async () => {
			const [period, member] = await Promise.all([
				prisma.period.findUniqueOrThrow({ where: { id: data.periodId } }),
				prisma.member.findUniqueOrThrow({
					where: { userId_eventId: { userId: session.user.id, eventId } },
					include: {
						subscribes: {
							where: { state: { in: ['accepted', 'request'] } },
							include: { period: true },
						},
					},
				}),
			])
			const _isLeader = await isLeader(period.teamId, locals)
			const isSelfSubscribe = data.memberId === member.id
			if (!_isLeader && !isSelfSubscribe) throw error(401)

			if (
				!isFreeRange(
					period,
					member.subscribes.map((sub) => sub.period)
				)
			) {
				const message =
					(isSelfSubscribe ? 'Tu es' : 'Ce membre est') + ' déjà occupé durant cette période'
				throw error(401, message)
			}

			const subscribe = await prisma.subscribe.create({
				data: {
					...data,
					state: _isLeader && isSelfSubscribe ? 'accepted' : 'request',
					createdBy: isSelfSubscribe ? 'user' : 'leader',
				},
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

			if (_isLeader && isSelfSubscribe) return

			const to =
				subscribe.createdBy === 'user'
					? subscribe.period.team.leaders.map(({ user }) => user.email)
					: [subscribe.member.user.email]

			if (to.length)
				await sendEmailTemplate(EmailNewSubscribe, {
					from: subscribe.period.team.event.name,
					to,
					subject: 'Nouvelle inscription',
					props: { subscribe, author: session.user },
				})
		})
	},
}
