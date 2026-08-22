import type { SubscribeState } from '@prisma/client'
import { parseQuery } from 'fuma/server'
import z from 'zod'
import { addMemberComputedValues, eventLogsWhere, getLogs, permission, prisma } from '$lib/server'
import { LOG_FAMILIES, type LogFamily } from '$lib/log'

/** Ce que la section « à valider » montre: une demande qu'un responsable n'a pas encore tranchée. */
const TO_VALIDATE = { state: 'request', createdBy: 'user' } as const

export const load = async ({ url, parent, locals, params: { eventId } }) => {
	// `admin/+layout.server.ts` n'exige qu'un rôle de responsable: le tableau de bord, lui, porte
	// le journal — coordonnées éditées et réglages de l'évènement. Il est réservé aux admins.
	await permission.adminOrRoot(eventId, locals)
	const { event } = await parent()

	const query = parseQuery(url, {
		take: z.coerce.number().default(30),
		family: z.enum(Object.keys(LOG_FAMILIES) as [LogFamily, ...LogFamily[]]).optional(),
		memberId: z.string().optional(),
		teamId: z.string().optional(),
	})

	const { family, memberId, teamId } = query
	const inEvent = { period: { team: { eventId } } }

	const [members, subscribes, teams, periods, lastMembers, toValidate, nbToValidate] =
		await Promise.all([
			prisma.member.findMany({
				where: { eventId },
				select: { isValidedByEvent: true, isValidedByUser: true },
			}),
			prisma.subscribe.groupBy({ by: ['state'], where: inEvent, _count: { _all: true } }),
			prisma.team.count({ where: { eventId } }),
			prisma.period.aggregate({
				where: { team: { eventId } },
				_count: { _all: true },
				_sum: { maxSubscribe: true },
			}),
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
		stats: {
			membership: getMembershipDistribution(members),
			subscribes: getSubscribesDistribution(subscribes),
			teams,
			periods: periods._count._all,
			// Le besoin, tel que les créneaux le déclarent: c'est à lui que se compare le nombre
			// d'inscriptions validées.
			places: periods._sum.maxSubscribe ?? 0,
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

/** Même découpage que le résumé de la table des membres: les deux chiffres doivent concorder. */
function getMembershipDistribution(
	members: { isValidedByEvent: boolean; isValidedByUser: boolean }[]
): Record<MembershipDistKey, number> {
	const dist = { isValided: 0, isValidedByEvent: 0, isValidedByUser: 0 }
	members.forEach(({ isValidedByEvent, isValidedByUser }) => {
		if (isValidedByEvent && isValidedByUser) dist.isValided++
		else if (isValidedByUser) dist.isValidedByUser++
		else if (isValidedByEvent) dist.isValidedByEvent++
	})
	return dist
}

function getSubscribesDistribution(
	rows: { state: SubscribeState; _count: { _all: number } }[]
): Record<SubscribeState, number> {
	// Les états absents valent zéro: une distribution à trous se lirait comme une absence de
	// données, là où il s'agit d'une absence d'inscriptions.
	const dist: Record<SubscribeState, number> = {
		request: 0,
		accepted: 0,
		denied: 0,
		cancelled: 0,
	}
	rows.forEach(({ state, _count }) => (dist[state] = _count._all))
	return dist
}
