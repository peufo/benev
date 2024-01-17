import { ensureFieldsWithFilterIsVisible } from '$lib/material/table/server'
import { getMembers, membersFilterShape } from './getMembers'

export const load = async ({ url, parent }) => {
	const isFilterKey = (key: string) => key.startsWith('field_') || key in membersFilterShape
	ensureFieldsWithFilterIsVisible('members', url, isFilterKey)

	const { event } = await parent()
	const summary = url.searchParams.get('summary') === 'true'
	const { members, stats } = await getMembers(event, url)

	return {
		summary,
		members,
		stats,
	}
}
