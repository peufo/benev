import type { Prisma, Member, Event, Field } from '@prisma/client'
import { prisma } from '$lib/server'
import { createAvatarPlaceholder } from '$lib/server'

export interface FieldMapping {
	sourceFieldId: string
	targetFieldId: string | null // null = skip this field
	sourceFieldName: string // for display
	targetFieldName: string | null // for display
	sourceFieldType: string
	targetFieldType: string | null
}

export interface ImportOptions {
	sourceEventId: string
	targetEventId: string
	selectedMemberIds: string[]
	fieldMappings: FieldMapping[]
	preserveTeamAssignments: boolean
	sendInvitationEmails: boolean
}

export interface ImportResult {
	success: boolean
	importedCount: number
	skippedCount: number
	errors: string[]
	details: {
		imported: Array<{ id: string; name: string; email: string }>
		skipped: Array<{ name: string; email: string; reason: string }>
	}
}

type MemberWithFields = Member & {
	event: Event & { memberFields: Field[] }
}

type ImportableEvent = Event & {
	_count: { members: number }
}

export class MemberImportService {
	/**
	 * Get events that the user can import from (admin/owner only)
	 */
	async getImportableEvents(userId: string): Promise<ImportableEvent[]> {
		const events = await prisma.event.findMany({
			where: {
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
			orderBy: { name: 'asc' },
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
		sourceProfileJson: any,
		sourceFields: Field[],
		fieldMappings: FieldMapping[]
	): Record<string, any> {
		const transformedProfile: Record<string, any> = {}

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
	 * Check for existing members to avoid duplicates
	 */
	async getExistingMemberEmails(eventId: string, emails: string[]): Promise<Set<string>> {
		const existingMembers = await prisma.member.findMany({
			where: {
				eventId,
				email: { in: emails },
			},
			select: { email: true },
		})

		return new Set(existingMembers.map((m) => m.email).filter(Boolean) as string[])
	}

	/**
	 * Main import function
	 */
	async importMembers(options: ImportOptions, authorUserId: string): Promise<ImportResult> {
		const result: ImportResult = {
			success: false,
			importedCount: 0,
			skippedCount: 0,
			errors: [],
			details: {
				imported: [],
				skipped: [],
			},
		}

		try {
			// Get source members
			const sourceMembers = await this.getSourceMembers(options.sourceEventId)
			const selectedMembers = sourceMembers.filter((m) => options.selectedMemberIds.includes(m.id))

			// Get target event fields
			const targetFields = await this.getEventFields(options.targetEventId)
			const targetEvent = await prisma.event.findUniqueOrThrow({
				where: { id: options.targetEventId },
				select: { name: true },
			})

			// Check for existing members
			const memberEmails = selectedMembers.map((m) => m.email).filter(Boolean) as string[]
			const existingEmails = await this.getExistingMemberEmails(options.targetEventId, memberEmails)

			// Process each member
			for (const sourceMember of selectedMembers) {
				const memberName = `${sourceMember.firstName} ${sourceMember.lastName}`

				// Skip if member already exists
				if (sourceMember.email && existingEmails.has(sourceMember.email)) {
					result.skippedCount++
					result.details.skipped.push({
						name: memberName,
						email: sourceMember.email,
						reason: 'Membre déjà existant',
					})
					continue
				}

				try {
					// Transform profile data
					const transformedProfile = this.transformProfileData(
						sourceMember.profileJson as Record<string, any>,
						sourceMember.event.memberFields,
						options.fieldMappings
					)

					// Create new member
					const newMember = await prisma.member.create({
						data: {
							eventId: options.targetEventId,
							email: sourceMember.email,
							phone: sourceMember.phone,
							firstName: sourceMember.firstName,
							lastName: sourceMember.lastName,
							birthday: sourceMember.birthday,
							street: sourceMember.street,
							zipCode: sourceMember.zipCode,
							city: sourceMember.city,
							profileJson: transformedProfile,
							isValidedByEvent: true, // Auto-validate imported members
							avatarPlaceholder: createAvatarPlaceholder(),
							// Notification settings
							isNotifiedSubscribe: !!sourceMember.email,
							isNotifiedLeaderOfSubscribe: !!sourceMember.email,
							isNotifiedAdminOfNewMember: !!sourceMember.email,
						},
					})

					result.importedCount++
					result.details.imported.push({
						id: newMember.id,
						name: memberName,
						email: sourceMember.email || '',
					})
				} catch (error) {
					result.errors.push(`Erreur lors de l'import de ${memberName}: ${error}`)
					result.details.skipped.push({
						name: memberName,
						email: sourceMember.email || '',
						reason: 'Erreur lors de la création',
					})
				}
			}

			result.success = result.errors.length === 0
		} catch (error) {
			result.errors.push(`Erreur générale: ${error}`)
		}

		return result
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
