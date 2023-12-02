import { getMembers } from './getMembers'

export const load = async ({ url, parent }) => {
	const { event } = await parent()
	return getMembers(event, url)
}
