import { pageShema } from '$lib/validation'
import { fail, redirect } from '@sveltejs/kit'
import { parseFormData, prisma, tryOrFail, permission } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'

export const load = async ({ params }) => {
	const page = await prisma.page.findUnique({ where: { id: params.pageId } })

	if (!page) throw redirect(302, `/${params.eventId}/admin/pages`)
	return { page }
}

export const actions = {
	update_page: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, pageShema)
		if (err) return err

		const path = normalizePath(data.title)
		const reservedPaths = ['admin', 'me', 'teams', 'subscribes', 'help', 'api', 'invite', 'members']
		if (reservedPaths.includes(path))
			return fail(400, { message: `Les noms suivant sont réservés: ${reservedPaths.join(', ')}` })

		const samePage = await prisma.page.findFirst({
			where: { id: { not: data.id }, eventId, path },
		})
		if (samePage) return fail(400, { message: 'Ce titre est déjà utilisé' })

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
				where: { id: pageId, isIndex: false },
			})
		)
	},
}
