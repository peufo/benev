import { addMemberComputedValues, prisma, hidePrivateProfilValues } from '$lib/server'

export const load = async ({ parent }) => {
	const { user } = await parent()

	const members = await prisma.member.findMany({
		where: { userId: user.id, event: { deletedAt: null } },
		include: {
			user: true,
			event: { include: { memberFields: true } },
			leaderOf: true,
			subscribes: true,
			profile: true,
		},
	})
	const membersWithRole = members
		.map(addMemberComputedValues)
		.map((member) => hidePrivateProfilValues(member))
		.filter(({ event, roles }) => event.state !== 'draft' || roles.includes('leader'))

	return {
		members: membersWithRole,
	}
}
