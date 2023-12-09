import { error, json } from '@sveltejs/kit'
import { parseQuery, prisma } from '$lib/server'
import { z, teamConditionModel } from '$lib/validation'
import { isMemberAllowed } from '$lib/team'

export const GET = async ({ params: { eventId }, url }) => {
	const { conditions } = parseQuery(url, { conditions: z.array(teamConditionModel) })
	if (!conditions) throw error(400)
	const members = await prisma.member.findMany({
		where: { eventId },
		include: { user: true, profile: true },
	})

	const count = members.filter((member) => {
		const allowed = isMemberAllowed(conditions, member)
		return allowed
	}).length

	return json(count)
}
