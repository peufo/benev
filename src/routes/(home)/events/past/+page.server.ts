import { prisma } from '$lib/server'
import { pageMetaTags } from '$lib/seo'

export const load = async () => {
	const now = new Date()
	const events = await prisma.event.findMany({
		where: {
			state: { in: ['published', 'archived'] },
			deletedAt: null,
			OR: [{ endDate: { lt: now } }, { endDate: null, startDate: { lt: now } }],
		},
		orderBy: [{ startDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
	})
	return {
		events,
		metaTags: pageMetaTags({
			title: 'Évènements passés',
			description:
				'Les évènements qui ont fait appel à des bénévoles via benevio, des festivals aux manifestations sportives et associatives.',
		}),
	}
}
