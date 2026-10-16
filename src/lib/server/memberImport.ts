import type { Member, Event, Field } from '@prisma/client'
import { prisma } from '#lib/server/index.js'

export interface FieldMapping {
	sourceFieldId: string
	targetFieldId: string | null // null = skip this field
	sourceFieldName: string // for display
	targetFieldName: string | null // for display
	sourceFieldType: string
	targetFieldType: string | null
}

type MemberWithFields = Member & {
	event: Event & { memberFields: Field[] }
}

type ImportableEvent = Event & {
	_count: { members: number }
}

class MemberImportService {
	/**
	 * Get events that the user can import from (admin/owner only)
	 */
	async getImportableEvents(userId: string): Promise<ImportableEvent[]> {
		const events = await prisma.event.findMany({
			where: {
				deletedAt: null,
				OR: [
					{ ownerId: userId }, // User owns the event
					{
						members: {
							some: {
								userId,
								isAdmin: true, // User is admin
							},
						},
					},
				],
			},
			include: {
				_count: {
					select: { members: true },
				},
			},
			// L'édition précédente, la source la plus probable, sort en tête.
			orderBy: [{ startDate: { sort: 'desc', nulls: 'last' } }, { name: 'asc' }],
		})

		return events
	}

	/**
	 * Get members from source event with their profile data
	 */
	async getSourceMembers(eventId: string): Promise<MemberWithFields[]> {
		const members = await prisma.member.findMany({
			where: { eventId },
			include: {
				event: {
					include: { memberFields: { orderBy: { position: 'asc' } } },
				},
			},
			orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
		})

		return members
	}

	/**
	 * Get fields for mapping comparison
	 */
	async getEventFields(eventId: string): Promise<Field[]> {
		const fields = await prisma.field.findMany({
			where: { eventId },
			orderBy: { position: 'asc' },
		})

		return fields
	}

	/**
	 * Validate field mapping compatibility
	 */
	validateFieldMapping(sourceField: Field, targetField: Field): boolean {
		// Simple type compatibility check
		const compatibleTypes: Record<string, string[]> = {
			string: ['string', 'textarea'],
			textarea: ['string', 'textarea'],
			number: ['number', 'string'],
			boolean: ['boolean'],
			select: ['select', 'string'],
			multiselect: ['multiselect', 'string'],
		}

		const compatibleTargets = compatibleTypes[sourceField.type] || []
		return compatibleTargets.includes(targetField.type)
	}

	/**
	 * Transform profile data based on field mappings
	 */
	transformProfileData(
		sourceProfileJson: PrismaJson.MemberProfile,
		fieldMappings: FieldMapping[]
	): PrismaJson.MemberProfile {
		const transformedProfile: PrismaJson.MemberProfile = {}

		fieldMappings.forEach((mapping) => {
			if (!mapping.targetFieldId) return // Skip unmapped fields

			const sourceValue = sourceProfileJson[mapping.sourceFieldId]
			if (sourceValue === undefined || sourceValue === null) return

			// Basic type transformations
			let transformedValue = sourceValue

			if (mapping.sourceFieldType === 'number' && mapping.targetFieldType === 'string') {
				transformedValue = String(sourceValue)
			} else if (mapping.sourceFieldType === 'boolean' && mapping.targetFieldType === 'string') {
				transformedValue = sourceValue ? 'Oui' : 'Non'
			} else if (
				(mapping.sourceFieldType === 'select' || mapping.sourceFieldType === 'multiselect') &&
				mapping.targetFieldType === 'string'
			) {
				transformedValue = Array.isArray(sourceValue) ? sourceValue.join(', ') : String(sourceValue)
			}

			transformedProfile[mapping.targetFieldId] = transformedValue
		})

		return transformedProfile
	}

	/**
	 * Auto-generate field mappings based on name similarity
	 */
	generateFieldMappings(sourceFields: Field[], targetFields: Field[]): FieldMapping[] {
		const mappings: FieldMapping[] = []

		sourceFields.forEach((sourceField) => {
			// Try exact name match first
			let targetField = targetFields.find((tf) => tf.name === sourceField.name)

			// If no exact match, try case-insensitive match
			if (!targetField) {
				targetField = targetFields.find(
					(tf) => tf.name.toLowerCase() === sourceField.name.toLowerCase()
				)
			}

			// Validate compatibility if match found
			if (targetField && !this.validateFieldMapping(sourceField, targetField)) {
				targetField = undefined
			}

			mappings.push({
				sourceFieldId: sourceField.id,
				targetFieldId: targetField?.id || null,
				sourceFieldName: sourceField.name,
				targetFieldName: targetField?.name || null,
				sourceFieldType: sourceField.type,
				targetFieldType: targetField?.type || null,
			})
		})

		return mappings
	}
}

// Export singleton instance
export const memberImportService = new MemberImportService()
