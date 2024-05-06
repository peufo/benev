import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, json, addTeamComputedValues } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)

	const { err, data } = parseQuery(url, {
		search: z.string().optional(),
		ids: z.array(z.string()).optional(),
		take: z.number().default(5),
		onlyAvailable: z.boolean().optional(),
	})
	if (err) error(400)
	const { search = '', ids, take } = data

	if (ids)
		return json(
			await prisma.team.findMany({
				where: { eventId, id: { in: ids } },
				include: { periods: { include: { subscribes: true } } },
			})
		)

	const teams = await prisma.team
		.findMany({
			where: {
				eventId,
				name: { contains: search },
			},
			include: { periods: { include: { subscribes: true } } },
			take,
		})
		.then((teams) => teams.map(addTeamComputedValues))
		.then((teams) => {
			if (!data.onlyAvailable) return teams
			return teams.filter((team) => team.isAvailable)
		})

	return json(teams)
}
