import { getRequestEvent, query } from '$app/server'
import z from 'zod'
import { permission } from '$lib/server'
import { memberImportService } from '$lib/server/memberImport'

/**
 * Alimente l'`InputRelation` de `MemberImportDialog`. Le reste du parcours d'import passe
 * encore par `[eventId]/admin/members/import/+server.ts`.
 */
export const searchImportableEvents = query(
	z.object({ search: z.string() }),
	async ({ search }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
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
	}
)
