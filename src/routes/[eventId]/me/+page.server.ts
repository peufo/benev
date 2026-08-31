import { prisma, redirectToAuth, redirectToRegister } from '$lib/server'
import { memberIsRegistered } from '$lib/member'

export const load = async ({ url, parent, params: { eventId } }) => {
	const { member, user } = await parent()
	if (!user) throw redirectToAuth(url)
	if (!memberIsRegistered(member)) throw redirectToRegister(eventId, url)

	const memberId = member.id
	return {
		member,
		memberTeams: await prisma.team.findMany({
			where: { periods: { some: { subscribes: { some: { memberId } } } } },
			include: {
				leaders: true,
				periods: {
					where: { subscribes: { some: { memberId } } },
					orderBy: { start: 'asc' },
					include: {
						tags: true,
						subscribes: {
							where: { memberId },
							include: {
								member: {
									select: {
										userId: true,
									},
								},
							},
						},
					},
				},
			},
		}),
	}
}
