import { tryOrFail } from 'fuma/server'
import { parseFormData, prisma, permission } from '$lib/server'

import { giftCreate } from '$lib/validation'

export const load = async ({ params: { eventId } }) => {
	return {
		gifts: await prisma.gift.findMany({
			where: { eventId },
			include: { conditions: true },
		}),
	}
}

export const actions = {
	create_gift: async ({ request, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		const { err, data } = await parseFormData(request, giftCreate)
		if (err) return err
		return tryOrFail(() =>
			prisma.gift.create({
				data: { ...data, eventId },
				include: { conditions: true },
			})
		)
	},
}
