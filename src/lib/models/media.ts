import z from 'zod'
import { zStringNullable } from './form'

/**
 * `InputImage` soumet deux champs par image: `<clé>_image` (le fichier) et `<clé>_crop`
 * (le recadrage sérialisé). Sans clé, ils s'appellent simplement `image` et `crop`.
 *
 * Un `<input type="file">` vide n'envoie rien — SvelteKit écarte le fichier fantôme — d'où
 * l'optionnalité de bout en bout: c'est `media.upload` qui refuse une image manquante.
 */
export type Crop = z.infer<typeof zCrop>

const zCrop = z.object({
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
})

/** Le recadrage arrive en JSON, et vaut littéralement `"null"` tant qu'aucun n'a été fait. */
const zCropField = z
	.string()
	.optional()
	.transform((value, ctx): unknown => {
		if (!value || value === 'null' || value === 'undefined') return undefined
		try {
			return JSON.parse(value)
		} catch {
			ctx.addIssue({ code: 'custom', message: 'Recadrage invalide' })
			return z.NEVER
		}
	})
	.pipe(zCrop.optional())

export const modelMediaImage = z.object({
	image: z.instanceof(File).optional(),
	crop: zCropField,
})

/**
 * Une image choisie dans la médiathèque: `InputMedia` rend toujours son champ caché, donc une
 * chaîne vide signifie « image détachée » quand un champ absent laisse la valeur en place.
 * Les colonnes visées sont des scalaires nullables (`posterId`, `logoId`, `backgroundImageId`).
 */
export const zMediaId = zStringNullable(z.string())

export type MediaImageInput = { image?: File; crop?: Crop }
