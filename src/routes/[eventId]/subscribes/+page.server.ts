import { error } from '@sveltejs/kit'
import { subscribeShema } from '$lib/form'
import { parseFormData, prisma, sendEmailTemplate, tryOrFail } from '$lib/server'
import { EmailNewSubscribe } from '$lib/email'

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
				await sendEmailTemplate(EmailNewSubscribe, {
					from: subscribe.period.team.event.name,
					to: subscribe.period.team.leaders.map(({ user }) => user.email),
					subject: 'Un nouveau bénévole',
					props: { subscribe },
				})
		})
	},
}
