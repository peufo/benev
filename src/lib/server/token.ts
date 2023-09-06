import { isWithinExpiration, generateRandomString } from 'lucia/utils'
import type { TokenType } from '@prisma/client'
import { prisma } from '.'

export const generateToken = async (tokenType: TokenType, userId: string, expires?: number) => {
	const HOURE = 1000 * 60 * 60

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

	return token.userId
}
