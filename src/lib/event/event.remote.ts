import { error, invalid, redirect } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { modelEventCreate, modelEventSettings } from '$lib/models'
import { jsonOrDbNull, permission, prisma } from '$lib/server'
import { defaultEmailModels } from '$lib/email/models'
import { EVENT_TIER } from '$lib/constant'

/**
 * Deux formulaires décrivent un évènement: `EventForm` le crée avec le strict nécessaire, et
 * `/[eventId]/admin/settings` le complète en une soumission unique — identité, adhésion et
 * thème n'écrivant jamais qu'une même ligne `Event`.
 *
 * Affiche et logo n'existent qu'en modification: ce sont des médias de la médiathèque de
 * l'évènement, laquelle lui est postérieure.
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

export const createEvent = form(modelEventCreate, async ({ tier, ...data }, issue) => {
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
	if (tier === 'basic') redirect(303, `/${event.id}`)
	const price = EVENT_TIER[tier].priceId
	if (!price) redirect(303, `/${event.id}`)
	redirect(303, `/me/checkouts/create?price=${price}&eventId=${event.id}`)
})

export const updateEvent = form(modelEventSettings, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	const event = await prisma.event.update({
		where: { id: eventId },
		data: { ...data, location: jsonOrDbNull(data.location) },
	})
	// L'URL porte l'id: seul son changement rend la page courante morte. Rediriger à chaque
	// enregistrement remonterait le défilement d'une page de réglages volontairement longue.
	if (event.id !== eventId) redirect(303, `/${event.id}/admin/settings`)
})

export const deleteEvent = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	await prisma.event.delete({ where: { id: eventId } })
	redirect(303, '/me')
})
