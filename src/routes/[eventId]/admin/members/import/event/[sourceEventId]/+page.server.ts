import { error } from '@sveltejs/kit'
import { permission, prisma } from '#lib/server/index.js'

export const load = async ({ locals, parent, params: { eventId, sourceEventId } }) => {
	if (sourceEventId === eventId) error(400, 'Un évènement ne peut pas importer ses propres membres')
	// Le layout garde l'évènement cible; lire les membres de la source demande d'en être admin aussi.
	await parent()
	await permission.admin(sourceEventId, locals)

	return {
		sourceEvent: await prisma.event.findUniqueOrThrow({
			where: { id: sourceEventId, deletedAt: null },
			select: { id: true, name: true },
		}),
	}
}
