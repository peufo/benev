import { memberImportService } from '#lib/server/memberImport.js'

export const load = async ({ parent, params: { eventId } }) => {
	const { importerId } = await parent()
	const events = await memberImportService.getImportableEvents(importerId)

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
