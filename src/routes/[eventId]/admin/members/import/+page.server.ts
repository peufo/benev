import { permission } from '#lib/server/index.js'
import { memberImportService } from '#lib/server/memberImport.js'

export const load = async ({ locals, params: { eventId } }) => {
	const member = await permission.admin(eventId, locals)
	const events = await memberImportService.getImportableEvents(member.userId)

	return {
		importableEvents: events
			.filter((event) => event.id !== eventId)
			.map((event) => ({
				id: event.id,
				name: event.name,
				startDate: event.startDate,
				memberCount: event._count.members,
			})),
	}
}
