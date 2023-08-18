import { error } from '@sveltejs/kit'

export const load = async ({ parent }) => {
	const { isOwner, isLeaderInEvent } = await parent()
	if (!isOwner && !isLeaderInEvent) throw error(401)
}
