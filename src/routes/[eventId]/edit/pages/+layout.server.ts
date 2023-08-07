import { prisma } from '$lib/server'

export const load = async ({ params, depends }) => {
	depends('pages')
	return {
		pages: await prisma.page.findMany({ where: { eventId: params.eventId } }),
	}
}
