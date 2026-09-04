import { redirect } from '@sveltejs/kit'
import { auth, consumeToken, prisma, readUserToken } from '$lib/server'
import { NOINDEX, pageMetaTags } from '$lib/seo'

export const load = async ({ params, locals }) => {
	const token = await readUserToken('emailVerification', params.tokenId)
	const session = await locals.auth.validate()

	// Jeton inconnu — le plus souvent déjà honoré — ou périmé: le parcours ordinaire reprend la
	// main, et dira lui-même s'il faut se connecter.
	if (!token || token.isExpired) {
		if (token) await consumeToken(params.tokenId)
		redirect(302, '/me')
	}

	// Le jeton n'a été délivré qu'à cette adresse: le présenter prouve l'accès à la boîte, quelle
	// que soit la session ouverte. Le client étendu recopie le drapeau sur les `Member`, ce dont
	// dépend `userEmailVerifiedRequired`.
	await prisma.user.update({ where: { id: token.user.id }, data: { isEmailVerified: true } })

	// Une session ouverte sur un autre compte n'est pas remplacée en silence: la page propose le
	// changement, elle ne le décide pas. Le jeton survit — c'est lui qui ouvrira la bonne session
	// au rechargement.
	if (session && session.user.id !== token.user.id) {
		return {
			confirmedEmail: token.user.email,
			currentEmail: session.user.email,
			metaTags: pageMetaTags({ title: 'Adresse confirmée', ...NOINDEX }),
		}
	}

	await consumeToken(params.tokenId)
	if (!session) {
		const newSession = await auth.createSession({ userId: token.user.id, attributes: {} })
		locals.auth.setSession(newSession)
	}
	redirect(302, '/me')
}
