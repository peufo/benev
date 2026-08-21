import type { LogDataMap } from '$lib/log'
import { prisma } from './prisma'

export type LogContext = {
	eventId?: string | null
	userId?: string | null
	memberId?: string | null
	createdById?: string | null
}

/**
 * Écrit une ligne dans le journal.
 *
 * N'échoue jamais bruyamment: un journal qui tombe ne doit pas emporter ce qu'il journalise.
 * Le worker d'emails l'appelle notamment depuis son chemin d'erreur, où lever une seconde fois
 * ferait perdre la trace de la première.
 */
export async function createLog<T extends keyof LogDataMap>(
	type: T,
	data: LogDataMap[T],
	context: LogContext = {}
): Promise<void> {
	try {
		await prisma.log.create({
			data: {
				type,
				data,
				eventId: context.eventId ?? null,
				userId: context.userId ?? null,
				memberId: context.memberId ?? null,
				createdById: context.createdById ?? null,
			},
		})
	} catch (err) {
		console.error('[log] écriture impossible', err)
	}
}
