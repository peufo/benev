import { redirect } from '@sveltejs/kit'
import {
	claimInvite,
	clearInviteCookie,
	consumeInviteToken,
	readInviteToken,
	setInviteCookie,
} from '$lib/server'

/**
 * Le lien du mail d'invitation. Il ne consomme pas son jeton — l'invité a encore une session à
 * ouvrir et une charte à accepter — il le range dans un cookie et le dépose au pied du tunnel,
 * où le nom de l'évènement est visible et où l'étape 0 monte la page de connexion.
 */
export const GET = async ({ params, cookies, locals }) => {
	const token = await readInviteToken(params.tokenId)

	// Jeton inconnu — le plus souvent une invitation déjà honorée, dont le jeton a été consommé.
	// Il n'y a plus d'évènement où renvoyer: le tableau de bord les liste tous, et déroute vers la
	// connexion si personne n'est identifié.
	if (!token) {
		clearInviteCookie(cookies)
		redirect(302, '/me')
	}

	const { member, isExpired } = token

	// Périmé, ou déjà honoré: le parcours ordinaire reprend la main, et dira lui-même s'il faut
	// se connecter. Rien ne casse, le lien mène simplement là où il menait avant.
	if (isExpired || member.userId) {
		if (member.userId) await consumeInviteToken(member.id)
		clearInviteCookie(cookies)
		redirect(302, `/${member.eventId}/me`)
	}

	setInviteCookie(cookies, params.tokenId)

	// Déjà connecté: il n'y aura pas de passage par la page de connexion pour valider l'adresse,
	// c'est donc ici. `cookies.get` relit ce que la ligne précédente vient de poser.
	const session = await locals.auth.validate()
	if (session) await claimInvite(cookies, session.user)

	redirect(302, `/${member.eventId}/register`)
}
