import { pageUpdate } from '$lib/validation'
import { fail, redirect } from '@sveltejs/kit'
import { parseFormData, prisma, tryOrFail, permission } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'

export const load = async ({ params: { pageId, eventId } }) => {
	const page = await prisma.page.findUnique({ where: { id: pageId } })
	if (!page) redirect(302, `/${eventId}/admin/pages`)

	return {
		page,
		medias: await prisma.media.findMany({
			where: { OR: [{ eventId }, { logoOf: { id: eventId } }, { posterOf: { id: eventId } }] },
		}),
	}
}

export const actions = {
	update_page: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, pageUpdate)
		if (err) return err

		const path = normalizePath(data.title)
		const reservedPaths = [
			'admin',
			'me',
			'register',
			'teams',
			'subscribes',
			'help',
			'api',
			'invite',
			'members',
		]
		if (reservedPaths.includes(path))
			return fail(400, { message: `Les noms suivant sont réservés: ${reservedPaths.join(', ')}` })

		const samePageTitle = await prisma.page.findFirst({
			where: { id: { not: data.id }, eventId, path },
		})
		if (samePageTitle) return fail(400, { message: 'Ce titre est déjà utilisé' })

		if (data.type === 'charter') {
			const charterAlreadyExist = await prisma.page.findFirst({
				where: { id: { not: data.id }, eventId, type: 'charter' },
			})
			if (charterAlreadyExist)
				return fail(400, { message: 'Il existe déjà une charte des bénévoles' })
		}

		return tryOrFail(() =>
			prisma.page.update({
				where: { id: data.id },
				data,
			})
		)
	},
	delete_page: async ({ locals, params: { eventId, pageId } }) => {
		await permission.admin(eventId, locals)

		return tryOrFail(() =>
			prisma.page.delete({
				where: { id: pageId, type: { not: 'home' } },
			})
		)
	},
}
