import { getSubscribes } from './getSubscribes'

export const load = async ({ url, parent }) => {
	const { event } = await parent()
	return getSubscribes(event, url)
}
