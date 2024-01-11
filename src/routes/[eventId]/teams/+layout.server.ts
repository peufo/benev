import { error } from '@sveltejs/kit'

export const load = async ({ parent }) => {
	const { event, member } = await parent()
	if (!event.selfSubscribeAllowed && !member?.roles.includes('leader')) {
		throw error(401)
	}
	return {}
}
