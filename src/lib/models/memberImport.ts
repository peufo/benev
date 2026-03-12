import { z, type ZodObj } from 'fuma'
import type {
	FieldMapping as FieldMappingType,
	ImportOptions as ImportOptionsType,
} from '$lib/server/memberImport'

export const modelFieldMapping = z.object({
	sourceFieldId: z.string(),
	targetFieldId: z.string().nullish(),
	sourceFieldName: z.string(),
	targetFieldName: z.string().nullish(),
	sourceFieldType: z.string(),
	targetFieldType: z.string().nullish(),
})

export const modelImportOptions = z.object({
	sourceEventId: z.string(),
	targetEventId: z.string(),
	selectedMemberIds: z.array(z.string()),
	fieldMappings: z.array(modelFieldMapping),
	preserveTeamAssignments: z.boolean().default(false),
	sendInvitationEmails: z.boolean().default(false),
})

export const modelImportEventsQuery = z.object({
	sourceEventId: z.string().optional(),
})
