import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, json } from '$lib/server'
import { modelMemberCondition } from '$lib/models'
import { isMemberAllowed } from '$lib/member'

export const GET = async ({ params: { eventId }, url }) => {
	const data = parseQuery(url, { conditions: z.jsonArray(modelMemberCondition) })
	const members = await prisma.member.findMany({
		where: { eventId },
	})
	const count = members.filter((member) => isMemberAllowed(data.conditions, member)).length

	return json(count)
}
