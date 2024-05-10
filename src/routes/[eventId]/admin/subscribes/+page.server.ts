import { ensureFieldsWithFilterAreVisibles } from 'fuma/server'
import { prisma } from '$lib/server'
import { getSubscribes, subscribesFilterShape } from './getSubscribes'

export const load = async ({ url, parent, params: { eventId } }) => {
	const { event } = await parent()
	const isFilterKey = (key: string) => key in subscribesFilterShape
	ensureFieldsWithFilterAreVisibles('subscribes', url, isFilterKey)
	const { subscribes } = await getSubscribes(event, url)
	return {
		subscribes,
		views: await prisma.view.findMany({
			where: { eventId, key: 'subscribes' },
		}),
	}
}
