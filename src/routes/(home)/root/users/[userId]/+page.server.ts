import { error } from '@sveltejs/kit'
import { addMemberComputedValues, hidePrivateProfilValues, prisma } from '$lib/server'

export const load = async ({ params }) => {
	const user = await prisma.user.findUnique({
		where: { id: params.userId },
	})
	if (!user) error(404, 'Utilisateur introuvable')

	const members = await prisma.member.findMany({
		where: { userId: user.id, event: { deletedAt: null } },
		orderBy: [{ event: { startDate: { sort: 'desc', nulls: 'first' } } }, { createdAt: 'desc' }],
		include: {
			user: true,
			event: { include: { memberFields: true, _count: { select: { members: true } } } },
			leaderOf: true,
		},
	})

	const membersWithRoles = members
		.map(addMemberComputedValues)
		.map((member) => hidePrivateProfilValues(member))

	return {
		user,
		members: membersWithRoles,
	}
}
