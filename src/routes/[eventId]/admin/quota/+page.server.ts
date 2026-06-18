import { error } from '@sveltejs/kit'
import { permission } from '$lib/server'

export const load = async ({ parent, locals }) => {
	const { event, userIsRoot } = await parent()
	const member = await permission.leaderWithoutQuotaCheck(event.id, locals).catch(() => undefined)
	if (!member && !userIsRoot) error(403)
	return {}
}
