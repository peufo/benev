import { getRangeOfTeam } from '$lib/plan/getRange'
import type { Event, Member, Period, Subscribe, Team, User, Prisma, Tag } from '@prisma/client'
import { prisma } from './prisma'
import type { MemberWithComputedValues } from './member'

export const safeUserSelect = {
	firstName: true,
	lastName: true,
	email: true,
	phone: true,
	avatarId: true,
	avatarPlaceholder: true,
} satisfies Prisma.UserSelect

type TeamWithLeadersAndPeriodsSubscribes = Team & {
	leaders: Member[]
	periods: (Period & {
		subscribes: (Subscribe & { member: { isValidedByUser: boolean } })[]
		tags: Tag[]
	})[]
}

export type AddTeamComputedValuesContext = {
	member?: MemberWithComputedValues
	isLeader?: boolean
	event?: Event
}

export function useAddTeamComputedValues(
	ctx: AddTeamComputedValuesContext = {}
): <T extends TeamWithLeadersAndPeriodsSubscribes>(
	team: T
) => Omit<T, 'periods'> & TeamWithComputedValues {
	const event = ctx.member?.event || ctx.event
	if (!event)
		throw new Error('event need to be provided in context (directly or by member argument)')

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
		const closeSubscribing = team?.closeSubscribing || event.closeSubscribing
		const DAY = 1000 * 60 * 60 * 24
		const isClosedSubscribing =
			!!closeSubscribing && closeSubscribing.getTime() + DAY < new Date().getTime()

		return addPeriodsComputedValues({
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

				if (isAvailable && event?.selfSubscribeAllowed && !team.isClosedSubscribing) {
					if (ctx?.member?.id) isDisabled = false
					else if (event?.selfRegisterAllowed) isDisabled = false
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
	tags: Tag[]
	subscribes: (Subscribe & { member: { isValidedByUser: boolean } })[]
	mySubscribe?: Subscribe & { member: { isValidedByUser: boolean } }
	isAvailable: boolean
	isComplete: boolean
	isDisabled: boolean
}

export type TeamWithComputedValues = Team & {
	leaders: Member[]
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

export async function getTeam(teamId: string, ctx?: AddTeamComputedValuesContext) {
	// TODO: hide email for public session
	// const isLeaderOfTeam =
	// 	ctx?.member?.roles.includes('admin') || !!ctx?.member?.leaderOf.find((t) => t.id === teamId)

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
						tags: true,
						subscribes: { include: { member: true } },
					},
				},
			},
		})
		.then(useAddTeamComputedValues(ctx))
	return team
}
