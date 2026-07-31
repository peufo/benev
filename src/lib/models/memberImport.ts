import z from 'zod'

const modelFieldMapping = z.object({
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
