import { error } from '@sveltejs/kit'
import { form, getRequestEvent, query } from '$app/server'
import z from 'zod'
import {
	countPendingSubscribeRequests,
	createLog,
	permission,
	prisma,
	rewriteLog,
	sendPendingSubscribeRequests,
} from '#lib/server/index.js'
import { runInBackground } from '#lib/server/background.js'
import type { LogInput } from '#lib/log/logMap.js'
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
	/**
	 * `announcedInvites` est le compte que la page a montré: une invitation retenue depuis, par un
	 * import ou un autre onglet, n'a été ni proposée ni confirmée. `sendInvites` est absent quand
	 * la case ne l'a pas été non plus.
	 */
	modelEventState.extend({
		sendInvites: z.boolean().optional(),
		announcedInvites: z.number().optional(),
	}),
	async ({ sendInvites, announcedInvites = 0, ...data }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		await permission.ownerOrRoot(eventId, locals)
		// `ownerOrRoot` rend `null` pour le root, qui n'est membre de rien: c'est la session qui
		// nomme l'acteur, valable dans les deux cas.
		const session = await locals.auth.validate()
		if (!session) error(401)

		const before = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })
		const publishing = data.state === 'published' && before.state !== 'published'
		if (publishing && (await countPendingInvites(eventId)) > announcedInvites)
			error(
				409,
				"D'autres invitations attendent depuis l'ouverture de la page: relis ce qui partira avant de publier"
			)
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

		const log = { event, before: before.state, actor: session.user }
		if (event.state !== 'published') {
			await createLog('event_state', log)
			return
		}
		return releaseHeldEmails(eventId, session.user, sendInvites ?? false, log)
	}
)

type StateLog = LogInput<'event_state'>
type Author = { userId: string; firstName: string; lastName: string; email: string }

/**
 * Ce que l'évènement fermé retenait part à sa publication. Les demandes d'inscription partent
 * toujours, comme à la sortie d'un secteur du brouillon; les invitations, seulement si la case
 * proposée est restée cochée, et un refus les efface.
 *
 * Les envois partent en arrière-plan: des centaines feraient tomber la requête sur un geste déjà
 * fait. La réponse dit ce qui part, la ligne du journal, écrite tout de suite, prend ensuite les
 * comptes de ce qui est vraiment parti.
 */
async function releaseHeldEmails(
	eventId: string,
	author: Author,
	sendInvites: boolean,
	log: StateLog
) {
	const declined = sendInvites ? 0 : await clearPendingInvites(eventId)
	const [invitations, requests] = await Promise.all([
		sendInvites ? countPendingInvites(eventId) : 0,
		countPendingSubscribeRequests(eventId),
	])
	const nothing = { invitations: 0, requests: 0, limited: 0, refused: 0, declined }
	const logId = await createLog('event_state', { ...log, released: nothing })
	if (invitations || requests)
		runInBackground(`publication ${eventId}`, async () => {
			const released = await sendHeldEmails(eventId, author, sendInvites)
			if (logId)
				await rewriteLog(logId, 'event_state', { ...log, released: { ...released, declined } })
		})
	return { invitations, requests }
}

async function sendHeldEmails(eventId: string, author: Author, sendInvites: boolean) {
	const authorName = `${author.firstName} ${author.lastName}`
	const requests = await sendPendingSubscribeRequests({ eventId }, authorName)
	if (!sendInvites) return { invitations: 0, requests, limited: 0, refused: 0 }
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
