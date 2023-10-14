import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => ({
	fields: await prisma.field.findMany({
		where: { eventId },
	}),
})
