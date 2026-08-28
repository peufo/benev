import { error, invalid, redirect } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { modelEventCreate, modelEventSettings } from '$lib/models'
import { resolve } from '$app/paths'
import { createLog, jsonOrDbNull, permission, prisma } from '$lib/server'
import { defaultEmailModels } from '$lib/email/models'
import { EVENT_TIER, THEME_PRESETS } from '$lib/constant'
import { diffChanges, hasChanges, projectEvent } from '$lib/log'

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
	'privacy',
	'legal-notice',
	'sales-terms',
	'open-source',
	'events',
	'pricing',
	'contact',
]

type EventIdentityIssue = {
	id(message: string): Parameters<typeof invalid>[0]
	name(message: string): Parameters<typeof invalid>[0]
}

/**
 * Nom et URL sont uniques dans toute la base, et l'URL sert en plus de préfixe de route: les
 * deux se valident au même endroit, à la création comme au réglage. `currentId` exclut
 * l'évènement de sa propre vérification.
 */
async function checkEventIdentity(
	{ id, name }: { id: string; name: string },
	issue: EventIdentityIssue,
	currentId?: string
) {
	if (RESERVED_IDS.includes(id))
		invalid(issue.id(`Les noms suivant sont réservés: ${RESERVED_IDS.join(', ')}`))
	if (id.startsWith('deleted_'))
		invalid(issue.id('Les noms ne peuvent pas commencer par "deleted_"'))
	if (id.startsWith('archived_'))
		invalid(issue.id('Les noms ne peuvent pas commencer par "archived_"'))

	// Un évènement supprimé garde sa ligne, préfixée: la contrainte de la base le compte encore.
	const taken = await prisma.event.findMany({
		where: { id: { not: currentId }, OR: [{ id }, { name }] },
		select: { id: true, name: true },
	})
	if (taken.some((event) => event.id === id)) invalid(issue.id('Cette URL est déjà prise'))
	if (taken.some((event) => event.name === name)) invalid(issue.name('Ce nom est déjà pris'))
}

export const createEvent = form(modelEventCreate, async ({ tier, ...data }, issue) => {
	const { locals } = getRequestEvent()
	const session = await locals.auth.validate()
	if (!session) error(401)

	await checkEventIdentity(data, issue)

	const { userId } = session.user
	const theme: keyof typeof THEME_PRESETS = 'benevio'
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
			backgroundPreset: theme,
			backgroundBlur: THEME_PRESETS[theme].backgroundBlur,
			backgroundBrightness: THEME_PRESETS[theme].backgroundBrightness,
			backgroundWhiteness: THEME_PRESETS[theme].backgroundWhiteness,
			backgroundGrain: THEME_PRESETS[theme].backgroundGrain,
		},
	})
	await prisma.member.create({
		data: {
			userId,
			eventId: event.id,
			isAdmin: true,
			isValidedByEvent: true,
		},
	})
	await createLog('event_create', { event, actor: session.user })
	if (tier === 'basic') redirect(303, resolve('/[eventId]', { eventId: event.id }))
	const price = EVENT_TIER[tier].priceId
	if (!price) redirect(303, resolve('/[eventId]', { eventId: event.id }))
	redirect(303, `/me/checkouts/create?price=${price}&eventId=${event.id}`)
})

export const updateEvent = form(modelEventSettings, async (data, issue) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const actor = await permission.admin(eventId, locals)
	await checkEventIdentity(data, issue, eventId)
	const before = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })
	const event = await prisma.event.update({
		where: { id: eventId },
		data: { ...data, location: jsonOrDbNull(data.location) },
	})
	const changes = diffChanges(projectEvent(before), projectEvent(event))
	if (hasChanges(changes)) await createLog('event_update', { event, changes, actor })
	// L'URL porte l'id: seul son changement rend la page courante morte. Rediriger à chaque
	// enregistrement remonterait le défilement d'une page de réglages volontairement longue.
	if (event.id !== eventId)
		redirect(303, resolve('/[eventId]/admin/settings', { eventId: event.id }))
})

export const deleteEvent = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	await prisma.event.delete({ where: { id: eventId } })
	redirect(303, '/me')
})
