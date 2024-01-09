import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient().$extends({
	query: {
		event: {
			async delete({ args: { where } }) {
				await prisma.event.update({ where, data: { deletedAt: new Date() } })
				return true
			},
		},
	},
})
