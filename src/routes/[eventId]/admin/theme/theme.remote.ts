import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { permission, prisma } from '$lib/server'

// `form()` exige que l'ENTRÉE du schéma soit compatible `RemoteFormInput`: chaînes,
// nombres, booléens ou File — jamais `null`, et jamais `unknown` (ce que produit
// `z.coerce.number()`). `modelEventTheme` a été écrit pour `parseFormData`: on déclare
// donc ici la forme réellement transmise par le formulaire, avec conversion explicite.
const schemaTheme = z.object({
	backgroundColor: z.string().optional(),
	backgroundImageId: z.string().optional(),
	backgroundBlur: z.string().transform(Number).optional(),
	backgroundBrightness: z.string().transform(Number).optional(),
	backgroundWhiteness: z.string().transform(Number).optional(),
	cardOpacity: z.string().transform(Number).optional(),
})

export const updateTheme = form(schemaTheme, async ({ backgroundImageId, ...data }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	return prisma.event.update({
		where: { id: eventId },
		data: {
			backgroundImage: idToConnectionData(backgroundImageId),
			...data,
		},
	})
})

function idToConnectionData(id?: string | null) {
	if (!id) return { disconnect: true }
	return { connect: { id } }
}
