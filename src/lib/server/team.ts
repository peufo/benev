import { getRangeOfTeam } from '$lib/plan/getRange'
import type { Member, Period, Prisma, Subscribe, Team, User } from '@prisma/client'
import { prisma } from './prisma'

export type TeamWithPeriods = Team & {
	periods: (Period & { subscribes: Subscribe[] })[]
}

export type TeamLeaders = {
	leaders: (Member & { user: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'> })[]
}
export type TeamWithLeaders = Team & TeamLeaders

export type TeamWithComputedValues = TeamWithPeriods & {
	maxSubscribes: number
	nbSubscribes: number
	nbSubscribesAccepted: number
	nbSubscribesRequest: number
	isAvailable: boolean
	range: { start: Date; end: Date } | null
}

export type TeamWithComputedValuesAndLeaders = TeamWithComputedValues & TeamLeaders

export function addTeamComputedValues<T extends TeamWithPeriods>(
	team: T
): T & TeamWithComputedValues {
	const subscribes = team.periods.map((p) => p.subscribes).flat()
	const nbSubscribesAccepted = subscribes.filter((sub) => sub.state === 'accepted').length
	const nbSubscribesRequest = subscribes.filter((sub) => sub.state === 'request').length
	const nbSubscribes = nbSubscribesAccepted + nbSubscribesRequest

	const maxSubscribes = team.periods.map((p) => p.maxSubscribe).reduce((acc, cur) => acc + cur, 0)
	return {
		...team,
		maxSubscribes,
		nbSubscribes,
		nbSubscribesAccepted,
		nbSubscribesRequest,
		isAvailable: nbSubscribes < maxSubscribes,
		range: getRangeOfTeam(team),
	}
}

export function hideTeamLeadersInfo<T extends TeamWithLeaders>(team: T): T {
	return {
		...team,
		leaders: team.leaders.map((leader) =>
			leader.isValidedByUser
				? leader
				: {
						...leader,
						user: {
							firstName: leader.user.firstName,
							lastName: leader.user.lastName,
							email: '',
							phone: null,
						},
				  }
		),
	}
}

export async function getTeam(teamId: string, includeSubscribeUser = false) {
	let team = await prisma.team.findUniqueOrThrow({
		where: { id: teamId },
		include: {
			leaders: {
				include: {
					user: {
						select: { firstName: true, lastName: true, email: true, phone: true },
					},
				},
			},
			periods: {
				orderBy: { start: 'asc' },
				include: {
					subscribes: includeSubscribeUser
						? {
								include: {
									member: {
										include: {
											user: {
												select: { firstName: true, lastName: true, email: true, phone: true },
											},
										},
									},
								},
						  }
						: true,
				},
			},
		},
	})

	return addTeamComputedValues(hideTeamLeadersInfo(team))
}
