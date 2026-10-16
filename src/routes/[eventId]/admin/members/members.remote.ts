import { getRequestEvent, query } from '$app/server'
import { zSearchInEvent } from '#lib/models/form.js'
import { permission, prisma } from '#lib/server/index.js'
import { getMembers } from './getMembers.server'

/**
 * Les adresses des membres que retient le filtre courant. L'argument est la query string de la
 * page: le filtrage est exactement celui de la table affichée, pas un second jeu de critères.
 */
export const getMembersEmails = query(zSearchInEvent, async ({ search, eventId }) => {
	const { locals } = getRequestEvent()
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})

	// `getMembers` ne lit que `searchParams`: l'origine de cette URL n'est jamais consultée.
	const filters = new URL(`?${search}`, 'https://benev.invalid')
	// La pagination de la table ne doit pas amputer l'envoi.
	filters.searchParams.set('all', 'true')

	const { members } = await getMembers(event, filters)
	return members.map(({ email }) => email).filter((email) => !!email)
})
