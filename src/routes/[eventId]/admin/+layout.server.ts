import { getUserIdOrRedirect } from '$lib/server/permission.js'
import { error } from '@sveltejs/kit'

export const load = async ({ parent, url, locals }) => {
	await getUserIdOrRedirect(url, locals)
	const { isOwner, isLeaderInEvent } = await parent()
	if (!isOwner && !isLeaderInEvent) throw error(401)
}
