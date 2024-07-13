import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, json, useAddTeamComputedValues, safeUserSelect } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	const member = await permission.leader(eventId, locals)

	const data = parseQuery(url, {
		search: z.string().optional(),
		ids: z.filter.multiselect,
		take: z.coerce.number().default(5),
		onlyAvailable: z.coerce.boolean().optional(),
	})

	const { search = '', ids, take } = data

	if (ids)
		return json(
			await prisma.team.findMany({
				where: { eventId, id: { in: ids } },
				include: { periods: { include: { subscribes: true } } },
			})
		)

	const addTeamComputedValues = useAddTeamComputedValues({ member, event: member.event })

	const teams = await prisma.team
		.findMany({
			where: {
				eventId,
				name: { contains: search },
			},
			include: {
				periods: { include: { subscribes: true } },
				leaders: {
					include: {
						user: { select: safeUserSelect },
					},
				},
			},
			take,
		})
		.then((teams) => teams.map(addTeamComputedValues))
		.then((teams) => {
			if (!data.onlyAvailable) return teams
			return teams.filter((team) => team.isAvailable)
		})

	return json(teams)
}
