import { PrismaClient } from '@prisma/client'
import { testEventUserSettingsUpdate } from './userProfil'

export const prisma = new PrismaClient().$extends({
	query: {
		event: {
			async update({ args, query }) {
				const result = await query(args)
				await testEventUserSettingsUpdate(args)
				return result
			},
		},
		user: {
			async update({ args, query }) {
				const result = await query(args)
				// TODO
				return result
			},
		},
	},
})
