import { lucia } from 'lucia'
import { sveltekit } from 'lucia/middleware'
import { prisma as adapter } from '@lucia-auth/adapter-prisma'
import { PrismaClient } from '@prisma/client'
import { dev } from '$app/environment'

export * from './formData'
export * from './permission'

export const prisma = new PrismaClient()

export const auth = lucia({
	adapter: adapter(prisma),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	getUserAttributes: (data) => ({
		userId: data.id,
		email: data.email,
		name: `${data.firstName} ${data.lastName}`,
		phone: data.phone,
	}),
})

export type Auth = typeof auth
