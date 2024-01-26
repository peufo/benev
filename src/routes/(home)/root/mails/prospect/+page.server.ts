import { prisma } from '$lib/server'

export const load = async () => ({
	prospect: await prisma.prospect.findFirst({}),
})
