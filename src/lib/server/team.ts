import { getRangeOfTeam } from '$lib/plan/getRange'
import type { Member, Period, Subscribe, Team, User } from '@prisma/client'
import { prisma } from './prisma'
import type { MemberWithComputedValues } from './member'

export type MemberWithUser = Member & {
	user: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>
}
export type TeamWithLeadersAndPeriodsSubscribes = Team & {
	leaders: MemberWithUser[]
	periods: (Period & { subscribes: Subscribe[] })[]
}

export type PeriodWithComputedValues = Period & {
	subscribes: Subscribe[]
	mySubscribe?: Subscribe
	isAvailable: boolean
	isComplete: boolean
	isDisabled: boolean
}

export type TeamWithComputedValues = Team & {
	leaders: MemberWithUser[]
	isLeader: boolean
	maxSubscribes: number
	nbSubscribes: number
	nbSubscribesAccepted: number
	nbSubscribesRequest: number
	isAvailable: boolean
	range: { start: Date; end: Date } | null
	periods: PeriodWithComputedValues[]
}

export function addTeamComputedValues<T extends TeamWithLeadersAndPeriodsSubscribes>(
	team: T,
	accesor?: MemberWithComputedValues
): T & TeamWithComputedValues {
	const subscribes = team.periods.map((p) => p.subscribes).flat()
	const nbSubscribesAccepted = subscribes.filter((sub) => sub.state === 'accepted').length
	const nbSubscribesRequest = subscribes.filter((sub) => sub.state === 'request').length
	const nbSubscribes = nbSubscribesAccepted + nbSubscribesRequest
	const maxSubscribes = team.periods.map((p) => p.maxSubscribe).reduce((acc, cur) => acc + cur, 0)
	const isLeader =
		accesor?.roles.includes('admin') || !!accesor?.leaderOf.find((t) => t.id === team.id)

	const res: T & TeamWithComputedValues = {
		...addPeriodsComputedValues(team, accesor),
		isLeader,
		maxSubscribes,
		nbSubscribes,
		nbSubscribesAccepted,
		nbSubscribesRequest,
		isAvailable: nbSubscribes < maxSubscribes,
		range: getRangeOfTeam(team),
	}
	return res
}

export function hideTeamLeadersInfo<T extends TeamWithLeadersAndPeriodsSubscribes>(team: T): T {
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

function addPeriodsComputedValues<T extends TeamWithLeadersAndPeriodsSubscribes>(
	team: T,
	accesor?: MemberWithComputedValues
): T & { periods: PeriodWithComputedValues[] } {
	const isLeaderOfTeam =
		accesor?.roles.includes('admin') || !!accesor?.leaderOf.find((t) => t.id === team.id)
	const closeSubscribing = team?.closeSubscribing || accesor?.event?.closeSubscribing
	const DAY = 1000 * 60 * 60 * 24
	const isTeamClosedSubscribing =
		!!closeSubscribing && closeSubscribing.getTime() < new Date().getTime() + DAY

	return {
		...team,
		periods: team.periods.map((period) => {
			const nbSubscribe = period.subscribes.filter(
				({ state }) => state === 'accepted' || state === 'request'
			).length
			const mySubscribe = period.subscribes.find((sub) => sub.memberId === accesor?.id)
			const isComplete = nbSubscribe >= period.maxSubscribe
			const isAvailable = !mySubscribe && !isComplete

			let isDisabled = true
			if (isLeaderOfTeam) isDisabled = false
			if (isAvailable && accesor?.event?.selfSubscribeAllowed && !isTeamClosedSubscribing) {
				if (accesor.id) isDisabled = false
				if (!accesor.id && accesor.event.selfRegisterAllowed) isDisabled = false
			}
			return {
				...period,
				mySubscribe,
				isAvailable,
				isComplete,
				isDisabled,
			}
		}),
	}
}

export async function getTeam(teamId: string, accesor?: MemberWithComputedValues) {
	const isLeaderOfTeam =
		accesor?.roles.includes('admin') || !!accesor?.leaderOf.find((t) => t.id === teamId)

	const team: TeamWithComputedValues = await prisma.team
		.findUniqueOrThrow({
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
						subscribes: isLeaderOfTeam
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
		.then((team) => addTeamComputedValues(team, accesor))
		.then(hideTeamLeadersInfo)

	return team
}
