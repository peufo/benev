import { ensureFieldsWithFilterAreVisibles } from '$lib/material/table/server'
import { getSubscribes, subscribesFilterShape } from './getSubscribes'

export const load = async ({ url, parent }) => {
	const { event } = await parent()
	const isFilterKey = (key: string) => key in subscribesFilterShape
	ensureFieldsWithFilterAreVisibles('subscribes', url, isFilterKey)
	return getSubscribes(event, url)
}
