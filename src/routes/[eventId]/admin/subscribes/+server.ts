import { json } from '@sveltejs/kit'
import { getSubscribes } from './getSubscribes'

export const GET = async ({ url, params: { eventId } }) => {
	const members = await getSubscribes(eventId, url)
	return json(members)
}
