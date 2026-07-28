import { prisma } from '$lib/server'
import { pageMetaTags } from '$lib/seo'

export const load = async () => {
	const now = new Date()
	const events = await prisma.event.findMany({
		where: {
			state: 'published',
			deletedAt: null,
			OR: [
				{ endDate: { gte: now } },
				{ endDate: null, startDate: { gte: now } },
				{ endDate: null, startDate: null },
			],
		},
		orderBy: [{ startDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
	})
	return {
		events,
		metaTags: pageMetaTags({
			title: 'Évènements à venir',
			description:
				'Découvre les évènements qui recrutent des bénévoles et rejoins une équipe en quelques clics.',
		}),
	}
}
