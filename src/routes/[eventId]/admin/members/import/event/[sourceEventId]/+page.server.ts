import { error } from '@sveltejs/kit'
import { permission, prisma } from '#lib/server/index.js'

export const load = async ({ locals, params: { eventId, sourceEventId } }) => {
	if (sourceEventId === eventId) error(400, 'Un évènement ne peut pas importer ses propres membres')
	// Les deux gardes: lire les membres de la source demande d'en être admin, comme de la cible.
	await permission.admin(eventId, locals)
	await permission.admin(sourceEventId, locals)

	return {
		sourceEvent: await prisma.event.findUniqueOrThrow({
			where: { id: sourceEventId, deletedAt: null },
			select: { id: true, name: true },
		}),
	}
}
