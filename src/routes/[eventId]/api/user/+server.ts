import { parseQuery } from 'fuma/server'
import { z } from 'fuma/validation'
import { prisma, json, permission } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)
	const { email } = parseQuery(url, {
		email: z.string().email(),
	})
	const user = await prisma.user.findFirst({ where: { email } })
	return json({
		firstName: user?.firstName,
		lastName: user ? `${user.lastName[0]}.` : undefined,
	})
}
