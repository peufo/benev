import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => ({
	teams: await prisma.team.findMany({
		where: { eventId },
		select: { id: true, name: true },
	}),
	fields: await prisma.field.findMany({
		where: { eventId },
	}),
})
