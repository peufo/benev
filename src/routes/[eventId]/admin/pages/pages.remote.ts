import { form, getRequestEvent } from '$app/server'
import { redirect } from '@sveltejs/kit'
import { permission, prisma } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'

export const createPage = form(async () => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)

	const pagesCount = await prisma.page.count({
		where: { eventId, type: { not: 'email' } },
	})
	const title = `Page ${pagesCount + 1}`

	const page = await prisma.page.create({
		data: { eventId, title, path: normalizePath(title), content: '' },
	})
	redirect(303, `/${eventId}/admin/pages/${page.id}`)
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
	redirect(303, `/${eventId}/admin/pages/badges/${badge.id}`)
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
