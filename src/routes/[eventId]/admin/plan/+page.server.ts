import { getPlanData } from './getPlanData'

export const load = async ({ url, params: { eventId } }) => {
	return getPlanData({ url, eventId })
}
