import { redirect } from '@sveltejs/kit'

export const load = async ({ parent }) => {
	const { user } = await parent()
	if (!user.isOrganizer) redirect(302, '/me/events')
	return {}
}
