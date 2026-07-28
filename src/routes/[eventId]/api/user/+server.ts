import { parseQuery } from '$lib/server/fuma'
import { z } from '$lib/fuma'
import { prisma, json, permission } from '$lib/server'

export const GET = async ({ params: { eventId }, url, locals }) => {
	await permission.leader(eventId, locals)
	const { email } = parseQuery(url, {
		email: z.string().email(),
	})
	const user = await prisma.user.findFirst({ where: { email } })
	if (!user) return json(null)
	return json({
		firstName: user.firstName,
		lastName: `${user.lastName[0]}.`,
	})
}
