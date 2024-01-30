import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ params, parent }) => {
	const { member } = await parent()

	// TODO: tryOr404
	const page = await prisma.page.findFirst({
		where: {
			eventId: params.eventId,
			path: params.pagePath,
			...(member ? {} : { type: { not: 'member' } }),
		},
	})
	if (!page) error(404)
	return { page }
}
