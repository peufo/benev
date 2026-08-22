import { parseQuery } from 'fuma/server'
import z from 'zod'
import { addMemberComputedValues, eventLogsWhere, getLogs, permission, prisma } from '$lib/server'
import { LOG_FAMILIES, type LogFamily } from '$lib/log'

/** Ce que la section « à valider » montre: une demande qu'un responsable n'a pas encore tranchée. */
const TO_VALIDATE = { state: 'request', createdBy: 'user' } as const

export const load = async ({ url, parent, locals, params: { eventId } }) => {
	await permission.leaderOrRoot(eventId, locals)
	const { event } = await parent()

	const query = parseQuery(url, {
		take: z.coerce.number().default(30),
		family: z.enum(Object.keys(LOG_FAMILIES) as [LogFamily, ...LogFamily[]]).optional(),
		memberId: z.string().optional(),
		teamId: z.string().optional(),
	})

	const { family, memberId, teamId } = query
	const inEvent = { period: { team: { eventId } } }

	const [lastMembers, toValidate, nbToValidate] = await Promise.all([
		prisma.member.findMany({
			where: { eventId },
			orderBy: { createdAt: 'desc' },
			take: 6,
			include: { user: true, leaderOf: true },
		}),
		prisma.subscribe.findMany({
			where: { ...inEvent, ...TO_VALIDATE },
			orderBy: { createdAt: 'desc' },
			take: 6,
			include: {
				period: { include: { team: { select: { id: true, name: true } } } },
				member: { include: { user: true, leaderOf: true } },
			},
		}),
		prisma.subscribe.count({ where: { ...inEvent, ...TO_VALIDATE } }),
	])

	return {
		journal: {
			family,
			subject: memberId
				? await prisma.member.findUnique({
						where: { id: memberId, eventId },
						select: { id: true, firstName: true, lastName: true },
					})
				: null,
			...(await getLogs(eventLogsWhere({ eventId, family, memberId, teamId }), {
				take: query.take,
			})),
		},
		lastMembers: lastMembers.map((member) => addMemberComputedValues({ ...member, event })),
		toValidate: toValidate.map((subscribe) => ({
			...subscribe,
			member: addMemberComputedValues({ ...subscribe.member, event }),
		})),
		nbToValidate,
	}
}

export type MembershipDistKey = 'isValided' | 'isValidedByEvent' | 'isValidedByUser'
