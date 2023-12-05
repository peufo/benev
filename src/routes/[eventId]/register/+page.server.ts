export const load = async ({ parent, url, params: { eventId } }) => {
	const { member, user } = await parent()
	if (!user) return { stepIndex: 0 }
	if (!member || !member.isValidedByUser) return { stepIndex: 1 }
	if (!member.isUserProfileCompleted) return { stepIndex: 2 }
	return { stepIndex: 3 }
}
