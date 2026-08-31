import type { MemberWithComputedValues } from '$lib/server'

type Registrable = Pick<
	MemberWithComputedValues,
	'userId' | 'isUserProfileCompleted' | 'isMemberProfileCompleted'
>

/**
 * Le tunnel d'inscription est arrivé à son terme: la fiche est reliée au compte, et les champs
 * que l'évènement rend obligatoires sont remplis.
 *
 * Seul prédicat de la question. Le tunnel et les gardes qui y renvoient doivent répondre pareil,
 * sinon ils se relancent l'un l'autre.
 */
export const memberIsRegistered = <T extends Registrable>(
	member?: T | null
): member is T & { userId: string } =>
	!!member?.userId && member.isUserProfileCompleted && member.isMemberProfileCompleted
