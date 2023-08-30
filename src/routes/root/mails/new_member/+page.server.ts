import { prisma } from '$lib/server'

export const load = async () => ({
	member: await prisma.member.findFirstOrThrow({
		include: { user: true, event: { include: { memberFields: true } } },
	}),
})
