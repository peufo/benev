import { parseQuery } from 'fuma/server'
import z from 'zod'
import { permission, prisma, getPeriodForm, getMilestoneForm, getPlanData } from '$lib/server'

export const load = async ({ locals, url, untrack, params: { eventId } }) => {
	const member = await permission.leader(eventId, locals)

	const { form_period, form_milestone } = parseQuery(url, {
		form_period: z.string().optional(),
		form_milestone: z.string().optional(),
	})

	return {
		...(await getPlanData({ url, untrack, event: member.event })),
		member,
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
		period: await getPeriodForm(form_period),
		milestone: await getMilestoneForm(form_milestone, eventId),
	}
}
