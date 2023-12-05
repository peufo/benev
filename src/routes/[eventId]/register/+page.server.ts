import { parseQuery } from '$lib/server/parseQuery.js'
import { z } from '$lib/validation'
import { redirect } from '@sveltejs/kit'

export const load = async ({ parent, url, params: { eventId } }) => {
	const { member, user } = await parent()
	if (!user) return { stepIndex: 0 }
	if (!member || !member.isValidedByUser) return { stepIndex: 1 }
	if (!member.isUserProfileCompleted) return { stepIndex: 2 }
	if (!member.isMemberProfileCompleted) return { stepIndex: 3 }

	const { redirectTo } = parseQuery(url, { redirectTo: z.string().optional() })
	console.log({ redirectTo }, member.isMemberProfileCompleted)
	throw redirect(302, redirectTo || `/${eventId}/me`)
}
