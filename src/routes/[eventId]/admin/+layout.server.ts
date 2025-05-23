import { prisma, getUserIdOrRedirect } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ parent, url, locals, params: { eventId } }) => {
	await getUserIdOrRedirect(url, locals)
	const { member, userIsRoot } = await parent()
	if (!member?.roles.includes('leader') && !userIsRoot) error(403)

	return {
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	}
}
