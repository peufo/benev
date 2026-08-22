import { parseQuery } from 'fuma/server'
import z from 'zod'
import { eventLogsWhere, getLogs, permission, prisma } from '$lib/server'
import { LOG_FAMILIES, type LogFamily } from '$lib/log'

export const load = async ({ url, locals, params: { eventId } }) => {
	// `admin/+layout.server.ts` n'exige qu'un rôle de responsable: le journal, lui, montre les
	// coordonnées éditées et les réglages de l'évènement. Il est réservé aux admins.
	await permission.adminOrRoot(eventId, locals)

	const query = parseQuery(url, {
		take: z.coerce.number().default(30),
		family: z.enum(Object.keys(LOG_FAMILIES) as [LogFamily, ...LogFamily[]]).optional(),
		memberId: z.string().optional(),
		teamId: z.string().optional(),
	})

	const { family, memberId, teamId } = query
	return {
		family,
		...(await getLogs(eventLogsWhere({ eventId, family, memberId, teamId }), {
			take: query.take,
		})),
		subject: memberId
			? await prisma.member.findUnique({
					where: { id: memberId, eventId },
					select: { id: true, firstName: true, lastName: true },
				})
			: null,
	}
}
