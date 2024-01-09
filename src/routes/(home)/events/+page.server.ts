import { prisma } from '$lib/server'

export const load = async () => {
	const events = await prisma.event.findMany({ where: { state: 'active', deletedAt: null } })
	return { events }
}
