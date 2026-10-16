import type { EventState } from '@prisma/client'

/**
 * L'archivage automatique d'un évènement oublié. Un évènement publié, terminé (ou sans date) et
 * sans signe de vie depuis `ARCHIVE_IDLE_DAYS` vaut un avertissement à son organisateur·ice; sans
 * « Garder ouvert » dans les `ARCHIVE_GRACE_DAYS` qui suivent, il est archivé.
 */
export const ARCHIVE_IDLE_DAYS = 30
export const ARCHIVE_GRACE_DAYS = 14

const DAY = 24 * 60 * 60 * 1000

export type ArchiveCandidate = {
	id: string
	state: EventState
	endDate: Date | null
	createdAt: Date
	archiveNoticeAt: Date | null
	archiveKeptAt: Date | null
	/**
	 * Le dernier log qui a un auteur. Les e-mails et ce que le serveur décide seul n'en ont pas: ils
	 * ne disent pas que quelqu'un s'occupe encore de l'évènement.
	 */
	lastLogAt: Date | null
}

export function lastSignOfLife(event: ArchiveCandidate): Date {
	const dates = [event.createdAt, event.archiveKeptAt, event.lastLogAt].filter((d) => !!d)
	return new Date(Math.max(...dates.map((d) => d.getTime())))
}

export function archiveDueAt(event: { archiveNoticeAt: Date | null }): Date | null {
	if (!event.archiveNoticeAt) return null
	return new Date(event.archiveNoticeAt.getTime() + ARCHIVE_GRACE_DAYS * DAY)
}

/**
 * Ce qui est dû à l'instant `now`. Un évènement passe par `notify` avant de pouvoir passer par
 * `archive`: c'est ce qui permet de lire un état plutôt qu'une date franchie, sans jamais archiver
 * par surprise.
 */
export function planArchive(events: ArchiveCandidate[], now: Date) {
	const idleLimit = now.getTime() - ARCHIVE_IDLE_DAYS * DAY
	const notify: string[] = []
	const archive: string[] = []
	for (const event of events) {
		if (event.state !== 'published') continue
		if (event.archiveNoticeAt) {
			if (archiveDueAt(event)!.getTime() <= now.getTime()) archive.push(event.id)
			continue
		}
		if (event.endDate && event.endDate.getTime() > idleLimit) continue
		if (lastSignOfLife(event).getTime() > idleLimit) continue
		notify.push(event.id)
	}
	return { notify, archive }
}
