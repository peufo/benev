import { isWithinExpiration, generateRandomString } from 'lucia/utils'
import type { TokenType } from '@prisma/client'
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

export const validateToken = async (tokenType: TokenType, tokenId: string) => {
	const [token] = await prisma.$transaction([
		prisma.token.findUniqueOrThrow({ where: { id: tokenId, type: tokenType } }),
		prisma.token.delete({ where: { id: tokenId, type: tokenType } }),
	])

	const tokenExpires = Number(token.expires)
	if (!isWithinExpiration(tokenExpires)) throw new Error('Expired token')
	// La colonne est nullable depuis que `invitation` vise un membre: ces deux types-là, eux,
	// n'existent que rattachés à un compte.
	if (!token.userId) throw new Error('Token without user')

	return token.userId
}

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
