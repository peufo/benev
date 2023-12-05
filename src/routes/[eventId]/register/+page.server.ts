import { parseQuery } from '$lib/server/parseQuery.js'

export const load = async ({ parent, url }) => {
	const { member, user } = await parent()

	if (!user) return { stepIndex: 0 }
	if (!member || !member.isValidedByUser) return { stepIndex: 1 }
	if (!member.isUserProfileCompleted) return { stepIndex: 2 }
	if (!member.isMemberProfileCompleted) return { stepIndex: 3 }

	// TODO: redirect
	return { stepIndex: 4 }
}
