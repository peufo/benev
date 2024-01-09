import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

export const prisma = new PrismaClient().$extends({
	query: {
		event: {
			async delete({ args: { where } }) {
				const event = await prisma.event.findUniqueOrThrow({ where })
				const id = `deleted_${event.id}_${createId()}`
				await prisma.event.update({ where, data: { id, deletedAt: new Date() } })
				return true
			},
		},
	},
})
