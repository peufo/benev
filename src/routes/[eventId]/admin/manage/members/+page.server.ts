import { getMembers } from './getMembers'

export const load = async ({ url, params: { eventId } }) => {
	return getMembers(eventId, url)
}
