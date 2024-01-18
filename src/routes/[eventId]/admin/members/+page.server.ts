import { ensureFieldsWithFilterAreVisibles } from '$lib/material/table/server'
import { getMembers, membersFilterShape } from './getMembers'
import { prisma } from '$lib/server'

export const load = async ({ url, parent, params: { eventId } }) => {
	const isFilterKey = (key: string) => key.startsWith('field_') || key in membersFilterShape
	ensureFieldsWithFilterAreVisibles('members', url, isFilterKey)

	const { event } = await parent()
	const summary = url.searchParams.get('summary') === 'true'
	const { members, stats } = await getMembers(event, url)

	return {
		summary,
		members,
		stats,
		views: await prisma.view.findMany({
			where: { eventId, key: 'members' },
		}),
	}
}
