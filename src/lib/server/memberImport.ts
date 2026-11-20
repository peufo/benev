import { prisma } from '#lib/server/index.js'
import type { SourceMember } from '#lib/member/import/index.js'

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
 * inscriptions et avatar restent attachés à l'évènement source; savoir qui dirige un secteur ne
 * sert qu'à cocher ces lignes-là d'un geste.
 */
export async function getSourceMembers(eventId: string) {
	const [rows, fields] = await Promise.all([
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
				_count: { select: { leaderOf: true } },
			},
			orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
		}),
		prisma.field.findMany({
			where: { eventId },
			select: { id: true, name: true, label: true, type: true, options: true },
			orderBy: { position: 'asc' },
		}),
	])
	const members: SourceMember[] = rows.map(({ _count, ...member }) => ({
		...member,
		isLeader: _count.leaderOf > 0,
	}))
	return { members, fields }
}
