import { parseQuery } from 'fuma/server'
import z from 'zod'
import { addMemberComputedValues, getEventJournal, permission, prisma } from '$lib/server'
import { WAITING, WAITING_KEYS, waitingOf, type Waiting } from './waiting'

export const load = async ({ url, parent, locals, params: { eventId } }) => {
	const actor = await permission.leaderOrRoot(eventId, locals)
	const { event } = await parent()
	// Le journal montre les coordonnées éditées et les réglages de l'évènement: comme sur la
	// fiche d'un membre, il reste réservé aux admins. Le reste de la page sert les responsables.
	const isAdmin = !actor || actor.roles.includes('admin')

	const { waiting } = parseQuery(url, { waiting: z.enum(WAITING_KEYS).default('us') })
	const inEvent = { period: { team: { eventId } } }

	const [journal, lastMembers, nbMembers, toValidate, waitingCounts, nbSubscribes, periods] =
		await Promise.all([
			isAdmin ? getEventJournal({ eventId, url }) : null,
			prisma.member.findMany({
				where: { eventId },
				orderBy: { createdAt: 'desc' },
				take: 6,
				include: { user: true, leaderOf: true },
			}),
			prisma.member.count({ where: { eventId } }),
			prisma.subscribe.findMany({
				where: { ...inEvent, state: 'request', createdBy: waitingOf(waiting).createdBy },
				orderBy: { createdAt: 'desc' },
				take: 6,
				include: {
					period: { include: { team: { select: { id: true, name: true } } } },
					member: { include: { user: true, leaderOf: true } },
				},
			}),
			// Les deux camps sont comptés, pas seulement celui qu'on regarde: le bouton de l'autre
			// annonce ce qu'il cache, sinon il faut cliquer pour savoir s'il y a quelque chose.
			prisma.subscribe.groupBy({
				by: ['createdBy'],
				where: { ...inEvent, state: 'request' },
				_count: { _all: true },
			}),
			prisma.subscribe.count({ where: { ...inEvent, state: { in: ['accepted', 'request'] } } }),
			// Le nombre d'inscriptions attendu, c'est la somme des places ouvertes par les périodes.
			prisma.period.aggregate({ where: { team: { eventId } }, _sum: { maxSubscribe: true } }),
		])

	const nbWaiting = Object.fromEntries(
		WAITING.map(({ key, createdBy }) => [
			key,
			waitingCounts.find((row) => row.createdBy === createdBy)?._count._all ?? 0,
		])
	) as Record<Waiting, number>

	return {
		journal,
		lastMembers: lastMembers.map((member) => addMemberComputedValues({ ...member, event })),
		nbMembers,
		waiting,
		toValidate: toValidate.map((subscribe) => ({
			...subscribe,
			member: addMemberComputedValues({ ...subscribe.member, event }),
		})),
		nbWaiting,
		nbSubscribes,
		maxSubscribes: periods._sum.maxSubscribe ?? 0,
	}
}

export type MembershipDistKey = 'isValided' | 'isValidedByEvent' | 'isValidedByUser'
