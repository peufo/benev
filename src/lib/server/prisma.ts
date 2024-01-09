import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient().$extends({
	query: {
		event: {
			async delete({ args: { where } }) {
				const event = await prisma.event.findUniqueOrThrow({ where })
				const id = `deleted_${event.id}`
				await prisma.event.update({ where, data: { id, deletedAt: new Date() } })
				return true
			},
		},
	},
})
