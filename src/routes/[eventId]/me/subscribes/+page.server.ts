import { getSubscribesData } from '$lib/me/MemberSubscribes'
import { getUserIdOrRedirect } from '$lib/server/permission.js'

export const load = async ({ url, locals }) => {
	const userId = await getUserIdOrRedirect(url, locals)
	return await getSubscribesData(userId)
}
