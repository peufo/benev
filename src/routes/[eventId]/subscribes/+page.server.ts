import { error } from '@sveltejs/kit'
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
				}),
			])
			const _isLeader = await isLeader(period.teamId, locals)
			const isSelfSubscribe = data.memberId === member.id

			if (!_isLeader && !isSelfSubscribe) throw error(401)

			const subscribe = await prisma.subscribe.create({
				data: {
					...data,
					state: _isLeader && isSelfSubscribe ? 'accepted' : 'request',
					request: isSelfSubscribe ? 'byUser' : 'byLeader',
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

			if (subscribe.period.team.leaders.length)
				await sendEmailTemplate(EmailNewSubscribe, {
					from: subscribe.period.team.event.name,
					to: subscribe.period.team.leaders.map(({ user }) => user.email),
					subject: 'Un nouveau bénévole',
					props: { subscribe },
				})
		})
	},
}
