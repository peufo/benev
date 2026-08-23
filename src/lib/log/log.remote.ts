import { error } from '@sveltejs/kit'
import { form, getRequestEvent, query } from '$app/server'
import z from 'zod'
import { createLog, eventLogsWhere, getLogs, permission, prisma } from '$lib/server'
import { LOG_FAMILIES, type LogFamily } from './logFamilies'

/**
 * Les notes sont la seule ligne du journal écrite à la main. Elles vivent dans `$lib/log` et non
 * à côté d'une route: le fil est monté depuis l'onglet Journal comme depuis la fiche d'un membre.
 */

export const createNote = form(
	z.object({
		memberId: z.string().optional(),
		message: z.string().trim().min(1, 'Note vide'),
	}),
	async ({ memberId, message }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		const actor = await permission.leader(eventId, locals)
		const member = memberId
			? await prisma.member.findUniqueOrThrow({ where: { id: memberId, eventId } })
			: null
		await createLog('note_create', { eventId, member, message, actor })
	}
)

/**
 * La seule brèche dans l'append-only du journal, et elle est étroite: une note est du contenu
 * écrit par quelqu'un, pas un constat du système. Indélébile, elle rendrait la fonctionnalité
 * inutilisable au premier envoi malheureux.
 */
export const deleteNote = form(z.object({ id: z.string() }), async ({ id }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	const actor = await permission.leader(eventId, locals)
	const note = await prisma.log.findUniqueOrThrow({ where: { id } })
	if (note.type !== 'note_create') error(403, 'Seule une note peut être supprimée')
	if (note.eventId !== eventId) error(403)
	const isAuthor = note.createdById === actor.userId
	if (!isAuthor && !actor.roles.includes('admin')) error(403, "Cette note n'est pas la tienne")
	await prisma.log.delete({ where: { id } })
})

/**
 * Les entrées antérieures à celles déjà affichées — ce que demande le bouton en tête du fil.
 *
 * Le filtre est reconstruit par `eventLogsWhere`, celui-là même qu'emploie le `load` de la page:
 * charger vers le haut ne peut pas faire apparaître ce que le filtre courant écarte.
 */
export const loadPreviousEventLogs = query(
	z.object({
		beforeId: z.string(),
		family: z.enum(Object.keys(LOG_FAMILIES) as [LogFamily, ...LogFamily[]]).optional(),
		memberId: z.string().optional(),
		teamId: z.string().optional(),
		take: z.number().min(1).max(100).default(30),
	}),
	async ({ beforeId, take, ...filter }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		await permission.adminOrRoot(eventId, locals)
		return getLogs(eventLogsWhere({ eventId, ...filter }), { take, beforeId })
	}
)
