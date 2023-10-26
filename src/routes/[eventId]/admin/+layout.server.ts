import { prisma, getUserIdOrRedirect } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ parent, url, locals, params: { eventId } }) => {
	await getUserIdOrRedirect(url, locals)
	const { isOwner, isLeaderInEvent } = await parent()
	if (!isOwner && !isLeaderInEvent) throw error(401)
	return {
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	}
}
