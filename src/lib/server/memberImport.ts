import { prisma } from '#lib/server/index.js'

/** Les évènements dont `userId` peut lire les membres: ceux qu'il possède ou administre. */
export function getImportableEvents(userId: string) {
	return prisma.event.findMany({
		where: {
			deletedAt: null,
			OR: [{ ownerId: userId }, { members: { some: { userId, isAdmin: true } } }],
		},
		select: { id: true, name: true, startDate: true, _count: { select: { members: true } } },
		// L'édition précédente, la source la plus probable, sort en tête.
		orderBy: [{ startDate: { sort: 'desc', nulls: 'last' } }, { name: 'asc' }],
	})
}

/**
 * Ce qu'un import reprend d'un autre évènement: coordonnées et profil. Rôles, secteurs dirigés,
 * inscriptions et avatar restent attachés à l'évènement source.
 */
export async function getSourceMembers(eventId: string) {
	const [members, fields] = await Promise.all([
		prisma.member.findMany({
			where: { eventId },
			select: {
				firstName: true,
				lastName: true,
				email: true,
				phone: true,
				birthday: true,
				street: true,
				zipCode: true,
				city: true,
				profileJson: true,
			},
			orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
		}),
		prisma.field.findMany({
			where: { eventId },
			select: { id: true, name: true, label: true, type: true, options: true },
			orderBy: { position: 'asc' },
		}),
	])
	return { members, fields }
}
