import { isWithinExpiration, generateRandomString } from 'lucia/utils'
import type { TokenType } from '@prisma/client'
import { error } from '@sveltejs/kit'
import { prisma } from '.'

const HOURE = 1000 * 60 * 60
const INVITE_TOKEN_LIFETIME = 90 * 24 * HOURE

export const generateToken = async (tokenType: TokenType, userId: string, expires?: number) => {
	const tokens = await prisma.token.findMany({ where: { userId, type: tokenType } })
	const reusableToken = tokens.find((token) => isWithinExpiration(Number(token.expires) - HOURE))
	if (reusableToken) return reusableToken.id

	const tokenId = generateRandomString(63)
	await prisma.token.create({
		data: {
			id: tokenId,
			type: tokenType,
			expires: expires || new Date().getTime() + 2 * HOURE,
			userId,
		},
	})

	return tokenId
}

/**
 * Consomme le jeton. Un lien déjà servi et un lien périmé se disent de la même façon: dans les
 * deux cas, ce qu'il reste à faire est d'en demander un autre.
 */
export const validateToken = async (tokenType: TokenType, tokenId: string) => {
	const token = await prisma.token.findUnique({ where: { id: tokenId, type: tokenType } })
	// Le compte de lignes effacées tranche entre deux soumissions simultanées du même lien.
	const consumed = token ? (await consumeToken(tokenId)).count > 0 : false
	if (!token || !consumed || !isWithinExpiration(Number(token.expires))) {
		error(400, 'Ce lien a expiré, demande-en un nouveau')
	}
	// `userId` n'est nul que pour un jeton `invitation`, qui vise un membre: les autres types
	// n'existent que rattachés à un compte.
	if (!token.userId) throw new Error('Token without user')

	return token.userId
}

/**
 * Lit sans consommer, comme `readInviteToken`: le lien de vérification peut tomber sur une session
 * ouverte par quelqu'un d'autre, et la page qui le dit doit laisser le jeton valable pour rouvrir
 * la bonne.
 */
export const readUserToken = async (tokenType: TokenType, tokenId: string) => {
	const token = await prisma.token.findUnique({
		where: { id: tokenId, type: tokenType },
		select: { expires: true, user: { select: { id: true, email: true } } },
	})
	if (!token?.user) return null
	return { user: token.user, isExpired: !isWithinExpiration(Number(token.expires)) }
}

/** `deleteMany`: deux clics concurrents sur le même lien ne doivent pas lever. */
export const consumeToken = (tokenId: string) => prisma.token.deleteMany({ where: { id: tokenId } })

/**
 * Le jeton du lien d'invitation. Il vit 90 jours — une invitation se lit rarement le jour même —
 * et tourne à chaque envoi: c'est ce qui révoque le lien parti à une adresse erronée quand un
 * responsable la corrige avant de renvoyer l'invitation.
 */
export const generateInviteToken = async (memberId: string) => {
	const tokenId = generateRandomString(63)
	await prisma.$transaction([
		prisma.token.deleteMany({ where: { memberId, type: 'invitation' } }),
		prisma.token.create({
			data: {
				id: tokenId,
				type: 'invitation',
				expires: new Date().getTime() + INVITE_TOKEN_LIFETIME,
				memberId,
			},
		}),
	])
	return tokenId
}

/**
 * Lit sans consommer, contrairement à `validateToken`: le parcours d'un invité prend plusieurs
 * requêtes — la page de connexion, l'aller-retour OAuth, puis chaque étape du tunnel — et un
 * jeton effacé au premier affichage laisserait tomber l'invitation en chemin. C'est `acceptInvite`
 * qui le supprime, une fois le membre lié à son compte.
 *
 * Un jeton périmé est rendu quand même: la page d'atterrissage a besoin de l'évènement pour
 * ramener la personne quelque part plutôt que sur l'accueil.
 */
export const readInviteToken = async (tokenId: string) => {
	const token = await prisma.token.findUnique({
		where: { id: tokenId, type: 'invitation' },
		include: { member: { include: { event: { select: { id: true, name: true } } } } },
	})
	if (!token?.member) return null
	return { member: token.member, isExpired: !isWithinExpiration(Number(token.expires)) }
}

/** Le membre invité, ou rien: périmé, ou déjà lié à un compte, le jeton n'ouvre plus rien. */
export const readValidInviteToken = async (tokenId: string) => {
	const token = await readInviteToken(tokenId)
	if (!token || token.isExpired || token.member.userId) return null
	return token.member
}

export const consumeInviteToken = (memberId: string) =>
	prisma.token.deleteMany({ where: { memberId, type: 'invitation' } })
