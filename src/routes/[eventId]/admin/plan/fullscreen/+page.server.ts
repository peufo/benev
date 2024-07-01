import { permission, prisma, parseFormKey, getTeam, getPeriodForm } from '$lib/server'
import { parseQuery } from 'fuma/server'
import { getPlanData } from '../getPlanData'
import { z } from 'fuma'

export const load = async ({ locals, url, params: { eventId } }) => {
	const member = await permission.leader(eventId, locals)
	member.event
	const { form_team, form_period } = parseQuery(url, {
		form_team: z.string().optional(),
		form_period: z.string().optional(),
	})

	const p = await getPeriodForm(form_period)

	return {
		...(await getPlanData({ url, eventId })),
		member,
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
		team: await parseFormKey(form_team, (id) => getTeam(id, { member }).catch(() => null)),
		period: await getPeriodForm(form_period),
	}
}
