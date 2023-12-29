import { error, json } from '@sveltejs/kit'
import { parseQuery, prisma } from '$lib/server'
import { z, teamConditionModel } from '$lib/validation'
import { isMemberAllowed } from '$lib/team'

export const GET = async ({ params: { eventId }, url }) => {
	const { data, err } = parseQuery(url, { conditions: z.array(teamConditionModel) })
	if (err) throw error(400)

	const members = await prisma.member.findMany({
		where: { eventId },
		include: { user: true, profile: true },
	})

	const count = members.filter((member) => isMemberAllowed(data.conditions, member)).length

	return json(count)
}
