import { permission } from '#lib/server/index.js'

/** Toutes les étapes de l'import lisent des membres et des champs: elles sont réservées aux admins. */
export const load = async ({ locals, params: { eventId } }) => {
	const member = await permission.admin(eventId, locals)
	return { importerId: member.userId }
}
