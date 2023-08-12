import { isWithinExpiration, generateRandomString } from 'lucia/utils'

import { prisma } from '.'

export const generateEmailVerificationToken = async (userId: string) => {
	const HOURE = 1000 * 60 * 60

	const tokens = await prisma.emailVerificationToken.findMany({ where: { userId } })
	const reusableToken = tokens.find(({ expires }) => isWithinExpiration(Number(expires) - HOURE))
	if (reusableToken) return reusableToken.id

	const tokenId = generateRandomString(63)
	await prisma.emailVerificationToken.create({
		data: {
			id: tokenId,
			expires: new Date().getTime() + 2 * HOURE,
			userId,
		},
	})
	return tokenId
}

export const validateEmailVerificationTOken = async (tokenId: string) => {
	const [token] = await prisma.$transaction([
		prisma.emailVerificationToken.findUniqueOrThrow({ where: { id: tokenId } }),
		prisma.emailVerificationToken.delete({ where: { id: tokenId } }),
	])

	const tokenExpires = Number(token.expires)
	if (!isWithinExpiration(tokenExpires)) throw new Error('Expired token')

	return token.userId
}
