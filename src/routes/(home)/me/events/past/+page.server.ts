import { getEventMembers, partitionEventMembers } from '../events.server'

export const load = async ({ parent }) => {
	const { user } = await parent()
	const { past } = partitionEventMembers(await getEventMembers(user))
	return { past }
}
