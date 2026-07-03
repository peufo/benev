import { parseFormKey, prisma } from '$lib/server'
import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { getPlanData } from './getPlanData'

export const load = async ({ url, params: { eventId } }) => {
	const { form_milestone } = parseQuery(url, {
		form_milestone: z.string().optional(),
	})

	return {
		...(await getPlanData({ url, eventId })),
		milestone: await parseFormKey(form_milestone, (id) =>
			prisma.milestone.findUnique({ where: { id, eventId } })
		),
	}
}
