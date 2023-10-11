import { json } from '@sveltejs/kit'
import { getMembers } from './getMembers'

export const GET = async ({ url, params: { eventId } }) => {
	const res = await getMembers(eventId, url)
	return json(res)
}
