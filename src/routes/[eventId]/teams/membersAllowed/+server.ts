import { error } from '@sveltejs/kit'
import { parseQuery, prisma, json } from '$lib/server'
import { z, memberConditionModel } from '$lib/validation'
import { isMemberAllowed } from '$lib/member'

export const GET = async ({ params: { eventId }, url }) => {
	const { data, err } = parseQuery(url, { conditions: z.array(memberConditionModel) })
	if (err) error(400)

	const members = await prisma.member.findMany({
		where: { eventId },
		include: { user: true },
	})

	const count = members.filter((member) => isMemberAllowed(data.conditions, member)).length

	return json(count)
}
