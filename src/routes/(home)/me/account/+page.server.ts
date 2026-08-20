import { getUserIdOrRedirect, prisma } from '$lib/server'

export const load = async ({ url, locals }) => {
	const userId = await getUserIdOrRedirect(url, locals)
	return {
		// `Event.owner` est en `onDelete: Cascade`: supprimer son compte détruit ses évènements et
		// les données de leurs bénévoles. Le nombre doit être sous les yeux au moment de confirmer.
		ownedEventsCount: await prisma.event.count({ where: { ownerId: userId, deletedAt: null } }),
	}
}
