import { getSubscribes } from './getSubscribes'

export const load = async ({ url, params: { eventId } }) => {
	return getSubscribes(eventId, url)
}
