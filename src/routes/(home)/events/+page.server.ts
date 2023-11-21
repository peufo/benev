import { prisma } from '$lib/server'

export const load = async () => {
	const events = await prisma.event.findMany({ where: { state: 'active' } })
	return { events }
}
