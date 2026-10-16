import path from 'node:path'
import fs from 'node:fs/promises'
import { MEDIA_DIR } from '$app/env/private'
import { Prisma } from '@prisma/client'
import { prisma } from '#lib/server/index.js'
import type { PosterEvent } from '#lib/landing/index.js'

/** Sous ce seuil, un évènement a toutes les chances d'être un essai. */
const POSTER_MIN_MEMBERS = 20
/** Douze se range sans reste en deux, trois, quatre et six colonnes. */
const POSTER_LIMIT = 12
/** Moins que cela ne fait pas un mur : une instance neuve n'affiche rien. */
const POSTER_MIN_COUNT = 4

export const load = async () => {
	const events = await prisma.event.findMany({
		where: {
			posterId: { not: null },
			state: { in: ['published', 'archived'] },
			deletedAt: null,
			startDate: { lte: new Date() },
		},
		select: {
			id: true,
			name: true,
			posterId: true,
			_count: { select: { members: { where: { isValidedByEvent: true } } } },
		},
		orderBy: { startDate: 'desc' },
	})
	// Une ligne `Media` peut survivre à son fichier : une affiche cassée n'a rien à faire en vitrine.
	const present = await Promise.all(
		events.map((event) =>
			fs.access(path.resolve(MEDIA_DIR, event.posterId!)).then(
				() => true,
				() => false
			)
		)
	)
	const selected = events
		.filter((event, i) => present[i] && event._count.members >= POSTER_MIN_MEMBERS)
		.slice(0, POSTER_LIMIT)
	if (selected.length < POSTER_MIN_COUNT) return { posterEvents: [] }

	const minutes = await prisma.$queryRaw<{ eventId: string; minutes: bigint }[]>`
		SELECT t.eventId, CAST(SUM(TIMESTAMPDIFF(MINUTE, p.start, p.end)) AS SIGNED) AS minutes
		FROM Subscribe s
		JOIN Period p ON p.id = s.periodId
		JOIN Team t ON t.id = p.teamId
		WHERE s.state = 'accepted' AND t.eventId IN (${Prisma.join(selected.map((e) => e.id))})
		GROUP BY t.eventId
	`
	const minutesByEvent = new Map(minutes.map((row) => [row.eventId, Number(row.minutes)]))

	const posterEvents: PosterEvent[] = selected.map((event) => ({
		// Des noms saisis comme des identifiants (« Spiegelberg Festival_2025 »)
		name: event.name.replaceAll('_', ' '),
		posterId: event.posterId!,
		members: event._count.members,
		hours: Math.round((minutesByEvent.get(event.id) ?? 0) / 60),
	}))
	return { posterEvents }
}
