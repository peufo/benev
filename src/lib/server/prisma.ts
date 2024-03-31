import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

export const prisma = new PrismaClient().$extends({
	query: {
		event: {
			async delete({ args: { where } }) {
				const event = await prisma.event.findUniqueOrThrow({ where })
				const deletedId = createId()
				const id = `deleted_${event.id}_${deletedId}`
				const name = `deleted_${event.name}_${deletedId}`
				await prisma.event.update({ where, data: { id, name, deletedAt: new Date() } })
				return true
			},
		},
	},
})
