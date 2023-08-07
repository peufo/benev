import { pageShema } from '$lib/form'
import { redirect } from '@sveltejs/kit'
import { isOwnerOrThrow, parseFormData, prisma } from '$lib/server'

export const load = async ({ params }) => {
	const page = await prisma.page.findUnique({ where: { id: params.pageId } })

	if (!page) throw redirect(301, `/${params.eventId}/edit/pages`)
	return { page }
}

export const actions = {
	update_page: async ({ params, locals, request }) => {
		await isOwnerOrThrow(params.eventId, locals)
		const { err, data } = await parseFormData(request, pageShema)
		if (err) return err

		await prisma.page.update({
			where: { id: data.id },
			data,
		})

		return
	},
	delete_page: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		await prisma.page.delete({
			where: { id: params.pageId },
		})

		return
	},
}
