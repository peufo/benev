import { error } from '@sveltejs/kit'
import { parseQuery } from 'fuma/server'
import { z } from 'fuma'
import { getTeam, prisma, getMemberProfile, parseFormKey, getPeriodForm } from '$lib/server'

export const load = async ({ parent, url, params: { eventId } }) => {
	const { user } = await parent()
	const userId = user?.id || ''
	try {
		const { form_team, form_field, form_period } = parseQuery(url, {
			form_team: z.string().optional(),
			form_field: z.string().optional(),
			form_period: z.string().optional(),
		})

		const member = await getMemberProfile({ userId, eventId }).catch(() => undefined)
		const isLeader = member?.roles.includes('leader')

		const event = await prisma.event.findUniqueOrThrow({
			where: { id: eventId, deletedAt: null },
			include: {
				memberFields: {
					where: isLeader ? {} : { memberCanRead: true },
					orderBy: { position: 'asc' },
				},
			},
		})

		const memberCanRegister =
			!member?.isValidedByUser && (event.selfRegisterAllowed || member?.isValidedByEvent)

		return {
			userId,
			event,
			member,
			memberCanRegister,
			pages: await prisma.page.findMany({
				where: { eventId, type: { not: 'email' } },
				select: { id: true, title: true, path: true, type: true },
			}),
			field: await parseFormKey(form_field, (id) =>
				prisma.field.findUnique({ where: { id, eventId } })
			),
			team: await parseFormKey(form_team, (id) => getTeam(id, { member, event }).catch(() => null)),
			period: await getPeriodForm(form_period),
		}
	} catch {
		error(404, 'not found')
	}
}
