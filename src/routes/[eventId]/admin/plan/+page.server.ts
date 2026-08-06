import { parseFormKey, prisma, getPlanData } from '$lib/server'
import { parseQuery } from 'fuma/server'
import z from 'zod'

export const load = async ({ url, untrack, params: { eventId }, parent }) => {
	const { event } = await parent()
	const { form_milestone } = parseQuery(url, {
		form_milestone: z.string().optional(),
	})

	return {
		...(await getPlanData({ url, untrack, event })),
		milestone: await parseFormKey(form_milestone, (id) =>
			prisma.milestone.findUnique({ where: { id, eventId } })
		),
	}
}
