import { error, invalid, redirect } from '@sveltejs/kit'
import { command, form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelEventCreate, modelEventSettings, modelEventUpdate } from '$lib/models'
import { modelEventImages } from '$lib/models/media'
import { jsonOrDbNull, media, permission, prisma, uploadImages } from '$lib/server'
import { defaultEmailModels } from '$lib/email/models'
import { EVENT_TIER } from '$lib/constant'

/**
 * `EventForm` sert à la fois la création (depuis `/`) et la mise à jour (depuis `/[eventId]`):
 * les deux formulaires vivent donc ici, à côté du composant.
 */

const RESERVED_IDS = [
	'auth',
	'me',
	'users',
	'members',
	'root',
	'admin',
	'token',
	'api',
	'media',
	'help',
	'terms',
	'events',
	'pricing',
	'contact',
]

export const createEvent = form(
	z.object({ ...modelEventCreate, ...modelEventImages }),
	async ({ tier, poster_image, poster_crop, logo_image, logo_crop, ...data }, issue) => {
		const { locals } = getRequestEvent()
		const session = await locals.auth.validate()
		if (!session) error(401)

		const exist = await prisma.event.findUnique({ where: { id: data.id } })
		if (exist) invalid(issue.name('Désolé, ce nom est déjà pris'))
		if (RESERVED_IDS.includes(data.id))
			invalid(issue.name(`Les noms suivant sont réservés: ${RESERVED_IDS.join(', ')}`))
		if (data.id.startsWith('deleted_'))
			invalid(issue.name('Les noms ne peuvent pas commencer par "deleted_"'))
		if (data.id.startsWith('archived_'))
			invalid(issue.name('Les noms ne peuvent pas commencer par "archived_"'))

		const { userId } = session.user
		const event = await prisma.event.create({
			data: {
				...data,
				location: jsonOrDbNull(data.location),
				tier: 'basic',
				ownerId: userId,
				pages: {
					createMany: {
						data: [
							{
								type: 'home',
								title: 'Bienvenue',
								path: 'bienvenue',
								content: 'null',
							},
							...defaultEmailModels,
						],
					},
				},
			},
		})
		await prisma.member.create({
			data: {
				userId,
				eventId: event.id,
				isAdmin: true,
				isValidedByEvent: true,
				isValidedByUser: true,
			},
		})
		await uploadImages({ poster_image, poster_crop, logo_image, logo_crop }, event.id, userId)

		if (tier === 'basic') redirect(303, `/${event.id}`)
		const price = EVENT_TIER[tier].priceId
		if (!price) redirect(303, `/${event.id}`)
		redirect(303, `/me/checkouts/create?price=${price}&eventId=${event.id}`)
	}
)

export const updateEvent = form(
	z.object({ ...modelEventUpdate, ...modelEventImages }),
	async ({ poster_image, poster_crop, logo_image, logo_crop, ...data }) => {
		const { locals, params } = getRequestEvent()
		const member = await permission.admin(params.eventId!, locals)
		const event = await prisma.event.update({
			where: { id: params.eventId! },
			data: { ...data, location: jsonOrDbNull(data.location) },
		})
		await uploadImages(
			{ poster_image, poster_crop, logo_image, logo_crop },
			event.id,
			member.userId
		)
		redirect(303, `/${event.id}/admin/event`)
	}
)

export const deleteEvent = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	await prisma.event.delete({ where: { id: eventId } })
	redirect(303, '/me')
})

// Ces deux-là sont des `command()`: leur bouton vit à l'intérieur du `<form>` de `EventForm`,
// où un second `<form>` serait du HTML invalide. C'est ce qu'un POST axios contournait avant.
export const deleteEventPoster = command(z.object({ id: z.string() }), async ({ id }) => {
	const { locals } = getRequestEvent()
	await permission.admin(id, locals)
	await media.delete({ posterOf: { id } })
})

export const deleteEventLogo = command(z.object({ id: z.string() }), async ({ id }) => {
	const { locals } = getRequestEvent()
	await permission.admin(id, locals)
	await media.delete({ logoOf: { id } })
})

export const updateEventSettings = form(z.object(modelEventSettings), async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	return prisma.event.update({ where: { id: eventId }, data })
})
