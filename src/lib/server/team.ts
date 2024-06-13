import { getRangeOfTeam } from '$lib/plan/getRange'
import type { Event, Member, Period, Subscribe, Team, User, Prisma } from '@prisma/client'
import { prisma } from './prisma'
import type { MemberWithComputedValues } from './member'

export type MemberWithUser = Member & {
	user: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'avatarId' | 'avatarPlaceholder'>
}
export const safeUserSelect = {
	firstName: true,
	lastName: true,
	email: true,
	phone: true,
	avatarId: true,
	avatarPlaceholder: true,
} satisfies Prisma.UserSelect

type TeamWithLeadersAndPeriodsSubscribes = Team & {
	leaders: MemberWithUser[]
	periods: (Period & { subscribes: Subscribe[] })[]
}

export type AddTeamComputedValuesContext = {
	member?: MemberWithComputedValues
	isLeader?: boolean
	event: Event
}

export function useAddTeamComputedValues(
	ctx?: AddTeamComputedValuesContext
): <T extends TeamWithLeadersAndPeriodsSubscribes>(
	team: T
) => Omit<T, 'periods'> & TeamWithComputedValues {
	return (team) => {
		const subscribes = team.periods.map((p) => p.subscribes).flat()
		const nbSubscribesAccepted = subscribes.filter((sub) => sub.state === 'accepted').length
		const nbSubscribesRequest = subscribes.filter((sub) => sub.state === 'request').length
		const nbSubscribes = nbSubscribesAccepted + nbSubscribesRequest
		const maxSubscribes = team.periods.map((p) => p.maxSubscribe).reduce((acc, cur) => acc + cur, 0)
		const isLeader =
			ctx?.isLeader ||
			ctx?.member?.roles.includes('admin') ||
			!!ctx?.member?.leaderOf.find((t) => t.id === team.id)
		const closeSubscribing = team?.closeSubscribing || ctx?.event.closeSubscribing
		const DAY = 1000 * 60 * 60 * 24
		const isClosedSubscribing =
			!!closeSubscribing && closeSubscribing.getTime() + DAY < new Date().getTime()

		return hideTeamLeadersInfo(
			addPeriodsComputedValues({
				...team,
				isLeader,
				isClosedSubscribing,
				maxSubscribes,
				nbSubscribes,
				nbSubscribesAccepted,
				nbSubscribesRequest,
				isAvailable: nbSubscribes < maxSubscribes,
				range: getRangeOfTeam(team),
			})
		)
	}

	function addPeriodsComputedValues<T extends ComputePeriodArg>(
		team: T
	): T & { periods: PeriodWithComputedValues[] } {
		return {
			...team,
			periods: team.periods.map((period) => {
				const nbSubscribe = period.subscribes.filter(
					({ state }) => state === 'accepted' || state === 'request'
				).length
				const mySubscribe = period.subscribes.find((sub) => sub.memberId === ctx?.member?.id)
				const isComplete = nbSubscribe >= period.maxSubscribe
				const isAvailable = !mySubscribe && !isComplete

				let isDisabled = true
				if (team.isLeader) isDisabled = false

				if (isAvailable && ctx?.event.selfSubscribeAllowed && !team.isClosedSubscribing) {
					if (ctx?.member?.id) isDisabled = false
					else if (ctx?.event.selfRegisterAllowed) isDisabled = false
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
	periods: PeriodWithComputedValues[]
	isLeader: boolean
	isAvailable: boolean
	isClosedSubscribing: boolean
	maxSubscribes: number
	nbSubscribes: number
	nbSubscribesAccepted: number
	nbSubscribesRequest: number
	range: { start: Date; end: Date } | null
}
type ComputePeriodArg = Omit<TeamWithComputedValues, 'periods'> &
	TeamWithLeadersAndPeriodsSubscribes

function hideTeamLeadersInfo<T extends { leaders: MemberWithUser[] }>(team: T): T {
	return {
		...team,
		leaders: team.leaders.map((leader) =>
			leader.isValidedByUser
				? leader
				: {
						...leader,
						user: {
							...leader.user,
							email: '',
							phone: null,
						},
				  }
		),
	}
}

export async function getTeam(teamId: string, ctx: AddTeamComputedValuesContext) {
	const isLeaderOfTeam =
		ctx.member?.roles.includes('admin') || !!ctx.member?.leaderOf.find((t) => t.id === teamId)

	const team: TeamWithComputedValues = await prisma.team
		.findUniqueOrThrow({
			where: { id: teamId },
			include: {
				leaders: {
					include: {
						user: { select: safeUserSelect },
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
												user: { select: safeUserSelect },
											},
										},
									},
							  }
							: true,
					},
				},
			},
		})
		.then(useAddTeamComputedValues(ctx))

	return team
}
