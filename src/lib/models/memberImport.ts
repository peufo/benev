import z from 'zod'
import type { ImportRow } from '#lib/member/import/index.js'

/** Assez petit pour qu'un lot rende la main vite, et que la progression avance par petits pas. */
export const IMPORT_BATCH_SIZE = 25

const zOptional = z.string().trim().min(1).optional()

export const modelMemberImportRow = z.object({
	line: z.number().int(),
	firstName: z.string().trim(),
	lastName: z.string().trim(),
	email: z.email().toLowerCase().optional(),
	phone: zOptional,
	birthday: z.iso.date().optional(),
	street: zOptional,
	zipCode: zOptional,
	city: zOptional,
	profile: z.record(
		z.string(),
		z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
	),
}) satisfies z.ZodType<ImportRow, ImportRow>

/** Un lot de lignes déjà converties par `buildMembers`. Le serveur ne rejoue que la validation. */
export const modelMemberImport = z.object({
	/** Ce que le journal fige: le nom du fichier, ou celui de l'évènement source. */
	source: z.string().trim().min(1).max(200),
	sendEmail: z.boolean(),
	rows: z.array(modelMemberImportRow).min(1).max(IMPORT_BATCH_SIZE),
})
