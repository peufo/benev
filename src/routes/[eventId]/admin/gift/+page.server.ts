import { tryOrFail, parseFormData } from 'fuma/server'
import { prisma, permission } from '$lib/server'

import { modelGiftCreate } from '$lib/models'

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

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelGiftCreate)

			return prisma.gift.create({
				data: { ...data, eventId },
				include: { conditions: true },
			})
		})
	},
}
