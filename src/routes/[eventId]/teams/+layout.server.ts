import { error } from '@sveltejs/kit'
import { canAccessEvent } from '#lib/event/eventAccess.js'

export const load = async ({ parent }) => {
	const { event, member, userIsRoot } = await parent()
	// Fermé, l'évènement affiche son annonce à la place de la page: pas d'erreur, qui la masquerait.
	if (!canAccessEvent(event, member, userIsRoot)) return {}
	if (!event.selfSubscribeAllowed && !member?.roles.includes('leader')) {
		error(401)
	}
	return {}
}
