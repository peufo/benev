import { error } from '@sveltejs/kit'
import { form, getRequestEvent, query } from '$app/server'
import z from 'zod'
import {
	countPendingSubscribeRequests,
	createLog,
	permission,
	prisma,
	sendPendingSubscribeRequests,
} from '#lib/server/index.js'
import {
	clearPendingInvites,
	countPendingInvites,
	sendPendingInvites,
} from '#lib/server/inviteBulk.js'
import { modelEventState } from '#lib/models/index.js'

/** Ce que l'évènement retient pour sa publication: le formulaire de statut l'annonce. */
export const getHeldEmails = query(z.string(), async (eventId) => {
	const { locals } = getRequestEvent()
	await permission.adminOrRoot(eventId, locals)
	const [invitations, requests] = await Promise.all([
		countPendingInvites(eventId),
		countPendingSubscribeRequests(eventId),
	])
	return { invitations, requests }
})

export const setEventState = form(
	// Absent quand la case n'a pas été proposée: rien n'attendait, ce qui attend depuis part.
	modelEventState.extend({ sendInvites: z.boolean().optional() }),
	async ({ sendInvites, ...data }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		await permission.ownerOrRoot(eventId, locals)
		// `ownerOrRoot` rend `null` pour le root, qui n'est membre de rien: c'est la session qui
		// nomme l'acteur, valable dans les deux cas.
		const session = await locals.auth.validate()
		if (!session) error(401)

		const before = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })
		// Un changement de statut à la main tranche la question: l'avertissement en cours n'a plus
		// d'objet. La transition n'a lieu que depuis l'état lu: de deux publications simultanées,
		// une seule relâche et journalise.
		const { count } = await prisma.event.updateMany({
			where: { id: eventId, state: before.state },
			data: { ...data, archiveNoticeAt: null },
		})
		if (!count) return
		const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })
		if (before.state === event.state) return

		const released =
			event.state === 'published'
				? await releaseHeldEmails(eventId, session.user, sendInvites ?? true)
				: undefined
		await createLog('event_state', { event, before: before.state, actor: session.user, released })
		return released
	}
)

/**
 * Ce que l'évènement fermé retenait part à sa publication. Les demandes d'inscription partent
 * toujours, comme à la sortie d'un secteur du brouillon; les invitations, seulement si la case
 * proposée est restée cochée, et un refus les efface.
 */
async function releaseHeldEmails(
	eventId: string,
	author: { userId: string; firstName: string; lastName: string; email: string },
	sendInvites: boolean
) {
	const authorName = `${author.firstName} ${author.lastName}`
	const requests = await sendPendingSubscribeRequests({ eventId }, authorName)
	if (!sendInvites) {
		await clearPendingInvites(eventId)
		return { invitations: 0, requests, limited: 0, refused: 0 }
	}
	const { sent, limited, refused } = await sendPendingInvites(eventId, author)
	return { invitations: sent, requests, limited, refused }
}

/** La réponse à l'avertissement d'archivage: l'évènement repart pour un délai d'inactivité complet. */
export const keepEventOpen = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.ownerOrRoot(eventId, locals)
	await prisma.event.update({
		where: { id: eventId },
		data: { archiveNoticeAt: null, archiveKeptAt: new Date() },
	})
})
