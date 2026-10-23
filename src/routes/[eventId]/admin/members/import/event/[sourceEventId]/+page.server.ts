import { error } from '@sveltejs/kit'
import { permission, prisma } from '#lib/server/index.js'
import { getSourceMembers } from '#lib/server/memberImport.js'
import { memberTable } from '#lib/member/import/index.js'

export const load = async ({ locals, parent, params: { eventId, sourceEventId } }) => {
	if (sourceEventId === eventId) error(400, 'Un évènement ne peut pas importer ses propres membres')
	// Le layout garde l'évènement cible; lire les membres de la source demande d'en être admin aussi.
	// Sans son quota: une édition passée au-delà de son offre reste une source, et la liste des
	// sources (`getImportableEvents`) la propose.
	await parent()
	await permission.adminWithoutQuotaCheck(sourceEventId, locals)

	const [sourceEvent, { members, fields }] = await Promise.all([
		prisma.event.findUniqueOrThrow({
			where: { id: sourceEventId, deletedAt: null },
			select: { id: true, name: true },
		}),
		getSourceMembers(sourceEventId),
	])

	return { sourceEvent, table: memberTable(members, fields) }
}
