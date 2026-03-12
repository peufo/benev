import { json, error } from '@sveltejs/kit'
import { z } from 'fuma'
import { permission } from '$lib/server'
import { memberImportService, type ImportOptions } from '$lib/server/memberImport'
import { modelImportOptions } from '$lib/models/memberImport'

/**
 * GET: Fetch importable events and source members
 */
export const GET = async ({ url, locals, params: { eventId } }) => {
	const member = await permission.admin(eventId, locals)
	const sourceEventId = url.searchParams.get('sourceEventId')

	if (!sourceEventId) {
		// Return list of importable events
		const importableEvents = await memberImportService.getImportableEvents(member.userId)

		// Filter out the current event
		const filteredEvents = importableEvents.filter((event) => event.id !== eventId)

		return json({
			type: 'events',
			events: filteredEvents.map((event) => ({
				id: event.id,
				name: event.name,
				memberCount: event._count.members,
				startDate: event.startDate,
				endDate: event.endDate,
			})),
		})
	} else {
		// Return members and fields from source event
		try {
			const [sourceMembers, sourceFields, targetFields] = await Promise.all([
				memberImportService.getSourceMembers(sourceEventId),
				memberImportService.getEventFields(sourceEventId),
				memberImportService.getEventFields(eventId),
			])

			// Generate suggested field mappings
			const suggestedMappings = memberImportService.generateFieldMappings(
				sourceFields,
				targetFields
			)

			return json({
				type: 'members_and_fields',
				members: sourceMembers.map((member) => ({
					id: member.id,
					firstName: member.firstName,
					lastName: member.lastName,
					email: member.email,
					phone: member.phone,
					profileData: Object.entries((member.profileJson as Record<string, any>) || {}).map(
						([fieldId, value]) => {
							const field = sourceFields.find((f) => f.id === fieldId)
							return {
								fieldName: field?.name || fieldId,
								value: value,
							}
						}
					),
				})),
				sourceFields: sourceFields.map((field) => ({
					id: field.id,
					name: field.name,
					label: field.label,
					type: field.type,
					required: field.required,
				})),
				targetFields: targetFields.map((field) => ({
					id: field.id,
					name: field.name,
					label: field.label,
					type: field.type,
					required: field.required,
				})),
				suggestedMappings,
			})
		} catch (err) {
			error(400, "Impossible de récupérer les données de l'événement source")
		}
	}
}

/**
 * POST: Execute member import
 */
export const POST = async ({ request, locals, params: { eventId } }) => {
	const member = await permission.admin(eventId, locals)

	try {
		const data = await request.json()
		const importOptions = modelImportOptions.parse(data)

		// Verify target event matches current event
		if (importOptions.targetEventId !== eventId) {
			error(400, "L'événement cible ne correspond pas à l'événement actuel")
		}

		// Convert the parsed data to match ImportOptions type
		const mappedOptions: ImportOptions = {
			...importOptions,
			fieldMappings: importOptions.fieldMappings.map((mapping) => ({
				...mapping,
				targetFieldId: mapping.targetFieldId || null,
				targetFieldName: mapping.targetFieldName || null,
				targetFieldType: mapping.targetFieldType || null,
			})),
		}

		// Execute import
		const result = await memberImportService.importMembers(mappedOptions, member.userId)

		return json(result)
	} catch (err) {
		if (err instanceof Error) {
			error(400, `Erreur lors de l'import: ${err.message}`)
		}
		error(500, 'Erreur interne du serveur')
	}
}
