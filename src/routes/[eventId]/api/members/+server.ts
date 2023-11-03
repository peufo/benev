import { json } from '@sveltejs/kit'
import { prisma, permission } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)

	const search = url.searchParams.get('search') || ''

	const members = await prisma.member.findMany({
		where: {
			eventId,
			user: {
				OR: [
					{ lastName: { contains: search } },
					{ firstName: { contains: search } },
					{ email: { contains: search } },
				],
			},
		},
		select: {
			id: true,
			user: {
				select: {
					firstName: true,
					lastName: true,
					email: true,
				},
			},
		},
		take: 5,
	})

	return json(members)
}
