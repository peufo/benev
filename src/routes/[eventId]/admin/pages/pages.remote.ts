import { command, form, getRequestEvent } from '$app/server'
import { redirect } from '@sveltejs/kit'
import z from 'zod'
import { permission, prisma } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'
import { resolve } from '$app/paths'

export const createPage = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)

	// Le chemin est unique par évènement: compter les pages ne suffit pas, une page renommée
	// « Page 2 » ferait échouer la création de la deuxième.
	const pages = await prisma.page.findMany({
		where: { eventId, type: { not: 'email' } },
		select: { path: true },
	})
	const paths = pages.map((page) => page.path)
	let n = pages.length + 1
	while (paths.includes(normalizePath(`Page ${n}`))) n++
	const title = `Page ${n}`

	// Une page naît en brouillon, et en queue de navigation.
	const page = await prisma.page.create({
		data: { eventId, title, path: normalizePath(title), content: '', position: pages.length },
	})
	redirect(303, resolve('/[eventId]/admin/pages/[pageId]', { eventId, pageId: page.id }))
})

/** Même contrat que `reorderTeams`: la liste des ids, dans l'ordre voulu. */
export const reorderPages = command(z.array(z.string()), async (ids) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	return prisma.$transaction(
		ids.map((id, position) => prisma.page.update({ where: { id, eventId }, data: { position } }))
	)
})

export const createBadge = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)

	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { badges: { select: { name: true } } },
	})
	if (event.badges.length >= 10)
		throw new Error("You can't create more than 10 badge configuration")

	const badge = await prisma.badge.create({
		data: {
			eventId,
			name: getNewBadgeName(event.badges),
			backgroundId: event.posterId,
			logoId: event.logoId,
		},
	})
	redirect(303, resolve('/[eventId]/admin/pages/badges/[badgeId]', { eventId, badgeId: badge.id }))
})

function getNewBadgeName(badges: { name: string }[]): string {
	if (!badges.length) return 'Badge standard'
	const names = badges.map((b) => b.name)
	let n = 2
	let newName = `Badge ${n}`
	while (names.includes(newName)) {
		newName = `Badge ${++n}`
	}
	return newName
}
