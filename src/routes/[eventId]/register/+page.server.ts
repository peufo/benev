export const load = async ({ parent }) => {
	const { member, user } = await parent()

	if (!user) return { stepIndex: 0 }

	if (!member || !member.isValidedByUser) return { stepIndex: 1 }

	return { stepIndex: 2 }
}
