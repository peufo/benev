import { ensureFieldsWithFilterAreVisibles } from 'fuma/server'
import { prisma } from '$lib/server'
import { getMembers, membersFilterShape } from './getMembers.server'

export const load = async ({ url, parent, params: { eventId } }) => {
	const isFilterKey = (key: string) => key.startsWith('field_') || key in membersFilterShape
	ensureFieldsWithFilterAreVisibles('members', url, isFilterKey)

	const { event } = await parent()

	const { members, stats } = await getMembers(event, url)
	return {
		members,
		stats,
		views: await prisma.view.findMany({
			where: { eventId, key: 'members' },
		}),
		badges: await prisma.badge.findMany({
			where: { eventId },
			select: { id: true, name: true },
		}),
	}
}
