import { lucia } from 'lucia'
import { sveltekit } from 'lucia/middleware'
import { prisma as adapter } from '@lucia-auth/adapter-prisma'
import { PrismaClient } from '@prisma/client'
import { dev } from '$app/environment'

export * from './formData'
export * from './permission'
export * from './email'
export * from './token'
export * from './try'

export const prisma = new PrismaClient()

export const auth = lucia({
	adapter: adapter(prisma),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	getUserAttributes: (data) => data,
})

export type Auth = typeof auth
