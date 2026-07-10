import { parseFormKey, prisma, getPlanData } from '$lib/server'
import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'

export const load = async ({ url, params: { eventId }, parent }) => {
	const { event } = await parent()
	const { form_milestone } = parseQuery(url, {
		form_milestone: z.string().optional(),
	})

	return {
		...(await getPlanData({ url, event })),
		milestone: await parseFormKey(form_milestone, (id) =>
			prisma.milestone.findUnique({ where: { id, eventId } })
		),
	}
}
