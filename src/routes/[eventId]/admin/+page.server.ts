import { error } from '@sveltejs/kit'

export const load = async ({ parent }) => {
	const { isOwner } = await parent()
	if (!isOwner) throw error(401)
}
