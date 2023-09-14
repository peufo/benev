import { isLeader } from '$lib/server'

export const load = async ({ params: { teamId }, locals }) => {
	return {
		isLeader: await isLeader(teamId, locals),
	}
}
