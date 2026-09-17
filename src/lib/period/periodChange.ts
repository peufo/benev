import type { SubscribeState } from '@prisma/client'

/**
 * Les inscriptions que le créneau engage: celles qui attendent une réponse comme celles déjà
 * acceptées. Hors brouillon, les deux ont reçu l'horaire par courriel.
 */
export const ENGAGED_STATES = ['accepted', 'request'] as const satisfies SubscribeState[]

export function engagedSubscribes<T extends { state: SubscribeState }>(subscribes: T[]): T[] {
	return subscribes.filter(({ state }) => (ENGAGED_STATES as readonly string[]).includes(state))
}

type Range = { start: Date | string; end: Date | string }

/** Tolère les chaînes ISO: une date qui a fait l'aller-retour JSON revient en chaîne. */
export function scheduleChanged(before: Range, after: Range): boolean {
	return (
		new Date(before.start).getTime() !== new Date(after.start).getTime() ||
		new Date(before.end).getTime() !== new Date(after.end).getTime()
	)
}

/** La phrase des confirmations, accordée: « 2 inscrit·es recevront un courriel avec … ». */
export function notifiedSentence(n: number, what: string): string {
	return `${n} inscrit·e${n > 1 ? 's' : ''} recevr${n > 1 ? 'ont' : 'a'} un courriel ${what}.`
}
