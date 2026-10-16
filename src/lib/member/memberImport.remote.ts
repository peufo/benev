import { getRequestEvent, query } from '$app/server'
import { zSearchInEvent } from '#lib/models/form.js'
import { permission } from '#lib/server/index.js'
import { memberImportService } from '#lib/server/memberImport.js'

/**
 * Alimente la liste de recherche de `MemberImportDialog`. Le reste du parcours d'import passe
 * encore par `[eventId]/admin/members/import/+server.ts`.
 */
export const searchImportableEvents = query(zSearchInEvent, async ({ search, eventId }) => {
	const { locals } = getRequestEvent()
	const member = await permission.admin(eventId, locals)

	const events = await memberImportService.getImportableEvents(member.userId)
	const needle = search.toLowerCase()

	return events
		.filter((event) => event.id !== eventId && event.name.toLowerCase().includes(needle))
		.map((event) => ({
			id: event.id,
			name: event.name,
			memberCount: event._count.members,
			startDate: event.startDate,
			endDate: event.endDate,
		}))
})
