import { getRequestEvent, query } from '$app/server'
import z from 'zod'
import { permission, prisma } from '$lib/server'
import { getMembers } from './getMembers.server'

/**
 * Les adresses des membres que retient le filtre courant. L'argument est la query string de la
 * page: le filtrage est exactement celui de la table affichée, pas un second jeu de critères.
 */
export const getMembersEmails = query(z.string().default(''), async (search) => {
	const { locals, params, url } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})

	const filters = new URL(url)
	filters.search = search
	// La pagination de la table ne doit pas amputer l'envoi.
	filters.searchParams.set('all', 'true')

	const { members } = await getMembers(event, filters)
	return members.map(({ email }) => email).filter((email) => !!email)
})
