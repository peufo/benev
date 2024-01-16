import { getMembers } from './getMembers'

export const load = async ({ url, parent }) => {
	const { event } = await parent()
	const summary = url.searchParams.get('summary') === 'true'
	return {
		summary,
		...(await getMembers(event, url)),
	}
}
