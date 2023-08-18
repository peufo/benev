import { json } from '@sveltejs/kit'
import { isOwnerOrThrow, prisma } from '$lib/server'

export const GET = async ({ params, url, locals }) => {
	await isOwnerOrThrow(params.eventId, locals)

	const search = url.searchParams.get('search') || ''

	const members = await prisma.member.findMany({
		where: {
			eventId: params.eventId,
			// TODO: isValidedByEvent: true,
			isValidedByUser: true,
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
				},
			},
		},
		take: 5,
	})

	return json(members)
}
