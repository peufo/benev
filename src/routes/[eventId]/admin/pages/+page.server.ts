import { redirect } from '@sveltejs/kit'
import { formAction, tryOrFail } from 'fuma/server'
import { prisma, permission } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'

export const load = async ({ params: { eventId } }) => {
	const homePage = await prisma.page.findFirstOrThrow({ where: { eventId, type: 'home' } })
	redirect(301, `/${eventId}/admin/pages/${homePage.id}`)
}

export const actions = {
	page_create: async ({ locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)

		const pagesCount = await prisma.page.count({
			where: { eventId: eventId, type: { not: 'email' } },
		})

		const title = `Page ${pagesCount + 1}`

		return tryOrFail(
			() =>
				prisma.page.create({
					data: {
						eventId: eventId,
						title,
						path: normalizePath(title),
						content: '',
					},
				}),
			(page) => `/${eventId}/admin/pages/${page.id}`
		)
	},
	badge_create: formAction({}, async ({ data, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const event = await prisma.event.findUniqueOrThrow({
			where: { id: eventId },
			include: { badges: { select: { name: true } } },
		})
		if (event.badges.length >= 10)
			throw new Error("You can't create more than 10 badge configuration")
		const name = getNewBadgeName(event.badges)
		return prisma.badge.create({
			data: { eventId, name, backgroundId: event.posterId, logoId: event.logoId },
		})
	}),
}

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
