import { prisma } from '$lib/server'

export const load = async ({ url, params: { eventId } }) => {
	return {
		fields: await prisma.field.findMany({
			orderBy: { position: 'asc' },
			where: { eventId },
		}),
	}
}
