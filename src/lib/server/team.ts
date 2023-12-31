import type { Period, Subscribe, Team } from '@prisma/client'

export type TeamWithPeriods = Team & {
	periods: (Period & { subscribes: Subscribe[] })[]
}

export type TeamWithComputedValues = TeamWithPeriods & {
	maxSubscribes: number
	nbSubscribes: number
	nbSubscribesAccepted: number
	nbSubscribesRequest: number
	isAvailable: boolean
}

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
	}
}
