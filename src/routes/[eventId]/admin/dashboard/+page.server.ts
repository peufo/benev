import { parseQuery } from 'fuma/server'
import type { Prisma } from '@prisma/client'
import z from 'zod'
import { addMemberComputedValues, getEventJournal, permission, prisma } from '$lib/server'
import { MEMBERS_VIEW_DEFAULT, MEMBERS_VIEW_KEYS } from './membersView'
import { WAITING, WAITING_KEYS, waitingOf, type Waiting } from './waiting'

export const load = async ({ url, parent, locals, params: { eventId } }) => {
	const actor = await permission.leaderOrRoot(eventId, locals)
	const { event } = await parent()
	// Le journal montre les coordonnées éditées et les réglages de l'évènement: comme sur la
	// fiche d'un membre, il reste réservé aux admins. Le reste de la page sert les responsables.
	const isAdmin = !actor || actor.roles.includes('admin')

	const { waiting, members: membersView } = parseQuery(url, {
		waiting: z.enum(WAITING_KEYS).optional(),
		members: z.enum(MEMBERS_VIEW_KEYS).default(MEMBERS_VIEW_DEFAULT),
	})

	// Sans inscription: ni acceptée, ni en attente. Un refus ou une annulation remet le membre
	// dans la liste — c'est quelqu'un à relancer.
	const withoutSubscribe = {
		subscribes: { none: { state: { in: ['accepted', 'request'] } } },
	} satisfies Prisma.MemberWhereInput

	// Un responsable ne pilote que ses secteurs: tout ce que la page compte s'y limite.
	const teamWhere: Prisma.TeamWhereInput = {
		eventId,
		...(isAdmin ? {} : { id: { in: actor.leaderOf.map(({ id }) => id) } }),
	}
	const inEvent = { period: { team: teamWhere } }

	const [
		journal,
		members,
		nbMembers,
		nbMembersWithoutSubscribe,
		toValidate,
		waitingCounts,
		teamsRaw,
	] = await Promise.all([
		isAdmin ? getEventJournal({ eventId, url }) : null,
		prisma.member.findMany({
			where: { eventId, ...(membersView === 'without' && withoutSubscribe) },
			orderBy: { createdAt: 'desc' },
			take: 6,
			include: { user: true, leaderOf: true },
		}),
		prisma.member.count({ where: { eventId } }),
		// Le compte tient dans le libellé du bouton: sans lui, il faut cliquer pour savoir
		// s'il reste quelqu'un à relancer.
		prisma.member.count({ where: { eventId, ...withoutSubscribe } }),
		prisma.subscribe.findMany({
			where: {
				...inEvent,
				state: 'request',
				...(waiting && { createdBy: waitingOf(waiting).createdBy }),
			},
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
		prisma.team.findMany({
			where: teamWhere,
			orderBy: { position: 'asc' },
			select: {
				id: true,
				name: true,
				periods: {
					select: {
						maxSubscribe: true,
						// Le condensé ne rend qu'une jauge: les refus et annulations n'y entrent pas.
						subscribes: {
							where: { state: { in: ['accepted', 'request'] } },
							select: {
								state: true,
								isForcedValidation: true,
								member: { select: { isValidedByUser: true } },
							},
						},
					},
				},
			},
		}),
	])

	// Un secteur se réduit à ce que `Progress` consomme: la somme des places de ses périodes et
	// leurs inscriptions mises à plat.
	const teams = teamsRaw.map(({ id, name, periods }) => ({
		id,
		name,
		nbPeriods: periods.length,
		maxSubscribe: periods.reduce((acc, period) => acc + period.maxSubscribe, 0),
		subscribes: periods.flatMap((period) => period.subscribes),
	}))

	const nbWaiting = Object.fromEntries(
		WAITING.map(({ key, createdBy }) => [
			key,
			waitingCounts.find((row) => row.createdBy === createdBy)?._count._all ?? 0,
		])
	) as Record<Waiting, number>

	return {
		journal,
		isAdmin,
		membersView,
		members: members.map((member) => addMemberComputedValues({ ...member, event })),
		nbMembers,
		nbMembersWithoutSubscribe,
		waiting,
		toValidate: toValidate.map((subscribe) => ({
			...subscribe,
			member: addMemberComputedValues({ ...subscribe.member, event }),
		})),
		nbWaiting,
		teams,
		// Dérivés des secteurs plutôt que comptés à part: les deux chiffres suivent alors la même
		// portée que la liste, sans risque de la contredire.
		nbSubscribes: teams.reduce((acc, team) => acc + team.subscribes.length, 0),
		maxSubscribes: teams.reduce((acc, team) => acc + team.maxSubscribe, 0),
	}
}

export type MembershipDistKey = 'isValided' | 'isValidedByEvent' | 'isValidedByUser'
