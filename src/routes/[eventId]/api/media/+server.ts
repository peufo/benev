import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, permission, json } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)
	const query = parseQuery(url, {
		search: z.string().optional(),
		// take: z.coerce.number().default(25),
		// skip: z.coerce.number().default(0),
	})
	const { search = '' } = query

	const medias = await prisma.media.findMany({
		where: {
			OR: [
				{ eventId }, //TODO: only use eventId instead
				{ logoOf: { id: eventId } },
				{ posterOf: { id: eventId } },
				{ backgroundOf: { id: eventId } },
			],
			name: { contains: search },
		},
		// skip,
		// take,
	})
	return json(medias)
}
