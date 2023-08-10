import { redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server'

export const load = async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(300, '/auth')

	const { userId } = session.user

	const events = await prisma.event.findMany({
		where: {
			teams: {
				some: {
					periods: {
						some: { subscribes: { some: { userId } } },
					},
				},
			},
		},
	})

	return {
		events: await prisma.event.findMany({
			where: {
				teams: {
					some: {
						periods: {
							some: {
								subscribes: {
									some: {
										userId,
									},
								},
							},
						},
					},
				},
			},
			include: { teams: true },
		}),
		subscribes: await prisma.subscribe.findMany({
			where: { userId },
			include: { period: true },
			orderBy: { period: { start: 'asc' } },
		}),
	}
}
