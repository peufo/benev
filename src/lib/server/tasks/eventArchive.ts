import type { Task } from '../scheduler'
import { prisma } from '../prisma'
import { createLog } from '../log'
import { sendEmailComponent } from '../email'
import { EmailArchiveNotice } from '#lib/email/index.js'
import { archiveDueAt, planArchive } from '#lib/event/eventArchive.js'

/**
 * Avertit puis archive les évènements oubliés (voir `#lib/event/eventArchive.js`).
 *
 * Contrairement à `teamSchedule`, cette tâche lit un état et non une date franchie dans sa
 * fenêtre: `until` lui sert d'instant présent. L'écart est sans risque, car aucun évènement n'est
 * archivé sans avoir d'abord reçu son avertissement, et un évènement déjà vieux au déploiement
 * passe par le même délai que les autres. Chaque écriture exige l'état de départ, ce qui la rend
 * idempotente: un « Garder ouvert » ou un changement de statut à la main l'emporte toujours.
 */
export const eventArchive: Task = {
	name: 'event-archive',
	every: 60 * 60_000,
	async run({ until }) {
		const events = await prisma.event.findMany({
			where: { state: 'published', deletedAt: null },
			select: {
				id: true,
				state: true,
				endDate: true,
				createdAt: true,
				archiveNoticeAt: true,
				archiveKeptAt: true,
				logs: {
					where: { createdById: { not: null } },
					orderBy: { createdAt: 'desc' },
					take: 1,
					select: { createdAt: true },
				},
			},
		})
		const { notify, archive } = planArchive(
			events.map(({ logs, ...event }) => ({ ...event, lastLogAt: logs[0]?.createdAt ?? null })),
			until
		)

		let applied = 0
		for (const id of notify) {
			const { count } = await prisma.event.updateMany({
				where: { id, state: 'published', archiveNoticeAt: null },
				data: { archiveNoticeAt: until },
			})
			if (!count) continue
			applied++
			const event = await prisma.event.findUniqueOrThrow({
				where: { id },
				include: { owner: true },
			})
			if (!event.owner.email) continue
			await sendEmailComponent(EmailArchiveNotice, {
				to: event.owner.email,
				subject: `Archivage prévu - ${event.name}`,
				props: { event, owner: event.owner, archiveAt: archiveDueAt(event)! },
				logContext: { eventId: event.id },
			})
		}

		for (const id of archive) {
			const event = events.find((e) => e.id === id)!
			const { count } = await prisma.event.updateMany({
				where: { id, state: 'published', archiveNoticeAt: event.archiveNoticeAt },
				data: { state: 'archived', archiveNoticeAt: null },
			})
			if (!count) continue
			applied++
			const archived = await prisma.event.findUniqueOrThrow({ where: { id } })
			await createLog('event_state', { event: archived, before: 'published', actor: null })
		}
		return applied
	},
}
