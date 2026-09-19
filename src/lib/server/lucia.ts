import { lucia } from 'lucia'
import { sveltekit } from 'lucia/middleware'
import { prisma as adapter } from '@lucia-auth/adapter-prisma'
import { dev } from '$app/env'
import { prisma } from './prisma'
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$app/env/private'
import { ORIGIN } from '$app/env/public'

import { google } from '@lucia-auth/oauth/providers'

export const auth = lucia({
	adapter: adapter(prisma),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	getUserAttributes: (data) => data,
})

export const googleAuth = google(auth, {
	clientId: GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	redirectUri: `${ORIGIN}/auth/google/callback`,
	scope: ['email', 'profile'],
})

export type Auth = typeof auth
