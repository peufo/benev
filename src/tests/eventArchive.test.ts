import { describe, it } from 'vitest'
import {
	ARCHIVE_GRACE_DAYS,
	ARCHIVE_IDLE_DAYS,
	archiveDueAt,
	planArchive,
	type ArchiveCandidate,
} from '#lib/event/eventArchive.js'

const now = new Date('2026-10-16T10:00:00Z')
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

/** Publié, fini et muet depuis bien plus que le délai: le candidat type. */
function candidate(overrides: Partial<ArchiveCandidate> = {}): ArchiveCandidate {
	return {
		id: 'e',
		state: 'published',
		endDate: daysAgo(60),
		createdAt: daysAgo(200),
		archiveNoticeAt: null,
		archiveKeptAt: null,
		lastLogAt: daysAgo(60),
		...overrides,
	}
}

describe('planArchive', () => {
	it("avertit un évènement fini et silencieux, sans l'archiver", ({ expect }) => {
		expect(planArchive([candidate()], now)).toEqual({ notify: ['e'], archive: [] })
	})

	it('avertit aussi un évènement sans date', ({ expect }) => {
		expect(planArchive([candidate({ endDate: null })], now).notify).toEqual(['e'])
	})

	it('laisse un évènement à venir, même sans activité', ({ expect }) => {
		const future = candidate({ endDate: new Date(now.getTime() + 1000) })
		expect(planArchive([future], now)).toEqual({ notify: [], archive: [] })
	})

	it('laisse un évènement fini depuis moins que le délai', ({ expect }) => {
		const recent = candidate({ endDate: daysAgo(ARCHIVE_IDLE_DAYS - 1) })
		expect(planArchive([recent], now).notify).toEqual([])
	})

	it('laisse un évènement fini mais encore actif', ({ expect }) => {
		const active = candidate({ lastLogAt: daysAgo(2) })
		expect(planArchive([active], now).notify).toEqual([])
	})

	it('laisse un évènement créé récemment, sans aucun log', ({ expect }) => {
		const fresh = candidate({ endDate: null, lastLogAt: null, createdAt: daysAgo(3) })
		expect(planArchive([fresh], now).notify).toEqual([])
	})

	it('relance le compteur après un « Garder ouvert »', ({ expect }) => {
		const kept = candidate({ archiveKeptAt: daysAgo(ARCHIVE_IDLE_DAYS - 1) })
		expect(planArchive([kept], now).notify).toEqual([])
		const keptLongAgo = candidate({ archiveKeptAt: daysAgo(ARCHIVE_IDLE_DAYS + 1) })
		expect(planArchive([keptLongAgo], now).notify).toEqual(['e'])
	})

	it("n'avertit pas deux fois, et archive au terme du délai de grâce", ({ expect }) => {
		const waiting = candidate({ archiveNoticeAt: daysAgo(ARCHIVE_GRACE_DAYS - 1) })
		expect(planArchive([waiting], now)).toEqual({ notify: [], archive: [] })
		const due = candidate({ archiveNoticeAt: daysAgo(ARCHIVE_GRACE_DAYS) })
		expect(planArchive([due], now)).toEqual({ notify: [], archive: ['e'] })
	})

	it('ne touche ni un brouillon ni un évènement déjà archivé', ({ expect }) => {
		const events = [
			candidate({ id: 'a', state: 'draft' }),
			candidate({ id: 'b', state: 'archived', archiveNoticeAt: daysAgo(30) }),
		]
		expect(planArchive(events, now)).toEqual({ notify: [], archive: [] })
	})
})

describe('archiveDueAt', () => {
	it("tombe le délai de grâce après l'avertissement", ({ expect }) => {
		expect(archiveDueAt({ archiveNoticeAt: null })).toBeNull()
		expect(archiveDueAt({ archiveNoticeAt: daysAgo(ARCHIVE_GRACE_DAYS) })).toEqual(now)
	})
})
