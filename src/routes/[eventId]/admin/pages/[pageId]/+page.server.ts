import { pageShema } from '$lib/form'
import { fail, redirect } from '@sveltejs/kit'
import { isOwnerOrThrow, parseFormData, prisma } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'

export const load = async ({ params }) => {
	const page = await prisma.page.findUnique({ where: { id: params.pageId } })

	if (!page) throw redirect(301, `/${params.eventId}/admin/pages`)
	return { page }
}

export const actions = {
	update_page: async ({ params, locals, request }) => {
		await isOwnerOrThrow(params.eventId, locals)
		const { err, data } = await parseFormData(request, pageShema)
		if (err) return err

		const path = normalizePath(data.title)
		const reservedPaths = ['edit', 'teams', 'users']
		if (reservedPaths.includes(path))
			return fail(400, { message: `Les noms suivant sont réservés: ${reservedPaths.join(', ')}` })

		const samePage = await prisma.page.findFirst({
			where: { id: { not: data.id }, eventId: params.eventId, path },
		})
		if (samePage) return fail(400, { message: 'Ce titre est déjà utilisé' })

		await prisma.page.update({
			where: { id: data.id },
			data,
		})

		return
	},
	delete_page: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		await prisma.page.delete({
			where: { id: params.pageId, isIndex: false },
		})

		return
	},
}
