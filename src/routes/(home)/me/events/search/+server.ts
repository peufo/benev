import { json, error } from '@sveltejs/kit'

import { prisma } from '$lib/server'

export const GET = async ({ url, locals }) => {
	const session = await locals.auth.validate()
	if (!session) error(401)

	const q = url.searchParams.get('q') || ''
	const events = await prisma.event.findMany({
		where: {
			ownerId: session.user.userId,
			deletedAt: null,
			name: { contains: q },
		},
		orderBy: { createdAt: 'desc' },
		take: 10,
		select: { id: true, name: true, tier: true },
	})

	return json(events)
}
