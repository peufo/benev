import { prisma } from '#lib/server/index.js'

export const load = async ({ params: { eventId } }) => {
	return {
		fields: await prisma.field.findMany({
			orderBy: { position: 'asc' },
			where: { eventId },
		}),
	}
}
