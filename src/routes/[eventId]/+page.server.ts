import { prisma } from '#lib/server/index.js'
import { canAccessEvent } from '#lib/event/eventAccess.js'

export const load = async ({ params, parent }) => {
	const { event, member, userIsRoot } = await parent()
	// Fermé, l'évènement n'affiche que son annonce: le contenu de l'accueil reste au serveur.
	if (!canAccessEvent(event, member, userIsRoot)) return { page: null }
	return {
		page: await prisma.page.findFirst({ where: { eventId: params.eventId, type: 'home' } }),
	}
}
