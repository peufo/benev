import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, json } from '$lib/server'
import { modelMemberCondition } from '$lib/models'
import { isMemberAllowed } from '$lib/member'

export const GET = async ({ params: { eventId }, url }) => {
	const { data, err } = parseQuery(url, { conditions: z.array(modelMemberCondition) })
	if (err) error(400)

	const members = await prisma.member.findMany({
		where: { eventId },
		include: { user: true },
	})
	const count = members.filter((member) => isMemberAllowed(data.conditions, member)).length

	return json(count)
}
