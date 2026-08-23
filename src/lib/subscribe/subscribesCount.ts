import type { Subscribe } from '@prisma/client'

export type SubscribeCountable = Pick<Subscribe, 'state' | 'isForcedValidation'> & {
	member: { userId: string | null }
}

export type PeriodCountable = {
	maxSubscribe: number
	subscribes: SubscribeCountable[]
}

export type SubscribesCount = {
	/** Toutes les inscriptions retenues : acceptedByMember + acceptedForced */
	accepted: number
	/** Confirmées par le bénévole lui-même */
	acceptedByMember: number
	/** Retenues d'office, sans confirmation du bénévole */
	acceptedForced: number
	request: number
	/** Demandes en attente du bénévole — celles où il a un compte pour répondre. */
	requestWaitUser: number
	maxSubscribe: number
	/** Dénominateur des jauges : suit le nombre de places, sauf débordement */
	total: number
	isComplet: boolean
}

/** Répartit les inscriptions d'une période — ou d'un ensemble de périodes agrégées — par état. */
export function countSubscribes({ maxSubscribe, subscribes }: PeriodCountable): SubscribesCount {
	let acceptedByMember = 0
	let acceptedForced = 0
	let request = 0
	let requestWaitUser = 0

	for (const { state, isForcedValidation, member } of subscribes) {
		if (state === 'accepted') {
			if (isForcedValidation) acceptedForced++
			else acceptedByMember++
		} else if (state === 'request') {
			request++
			if (member.userId) requestWaitUser++
		}
	}

	const accepted = acceptedByMember + acceptedForced

	return {
		accepted,
		acceptedByMember,
		acceptedForced,
		request,
		requestWaitUser,
		maxSubscribe,
		total: Math.max(accepted + request, maxSubscribe),
		isComplet: accepted + request >= maxSubscribe,
	}
}
