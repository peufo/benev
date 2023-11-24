import { error } from '@sveltejs/kit'
import { isFreeRange } from 'perod'
import { subscribeCreate } from '$lib/validation'
import { parseFormData, permission, prisma, sendEmailTemplate, tryOrFail } from '$lib/server'
import { EmailNewSubscribe } from '$lib/email'

export const actions = {
	new_subscribe: async ({ request, locals, params: { eventId } }) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)

		const { err, data } = await parseFormData(request, subscribeCreate)
		if (err) return err

		return tryOrFail(async () => {
			const [period, member] = await Promise.all([
				prisma.period.findUniqueOrThrow({
					where: { id: data.periodId },
					include: { subscribes: { where: { state: { in: ['accepted', 'request'] } } } },
				}),
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

			// Check if the period is already complet
			if (period.maxSubscribe <= period.subscribes.length) {
				throw error(403, 'Sorry, this period is already complet')
			}

			// Check if author as the right to create this subscribe
			const _isLeader = await permission
				.leaderOfTeam(period.teamId, locals)
				.then(() => true)
				.catch(() => false)
			const isSelfSubscribe = data.memberId === member.id
			if (!_isLeader && !isSelfSubscribe) throw error(403)

			// Check if member is free in this period
			const memberPeriods = member.subscribes.map((sub) => sub.period)
			if (!isFreeRange(period, memberPeriods)) {
				const startMessage = isSelfSubscribe ? 'You are' : 'This member is'
				throw error(403, `${startMessage} already busy during this period`)
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
									leaders: { include: { user: true } },
								},
							},
						},
					},
				},
			})

			if (_isLeader && isSelfSubscribe) return

			const memberMail = subscribe.member.user.email
			const leadersMail = subscribe.period.team.leaders.map(({ user }) => user.email)
			const to = subscribe.createdBy === 'user' ? leadersMail : memberMail
			const replyTo = subscribe.createdBy === 'user' ? memberMail : leadersMail

			if (to.length)
				await sendEmailTemplate(EmailNewSubscribe, {
					from: subscribe.period.team.event.name,
					to,
					replyTo,
					subject: 'Nouvelle inscription',
					props: { subscribe, author: session.user },
				})
		})
	},
}
