import { lucia } from 'lucia'
import { sveltekit } from 'lucia/middleware'
import { prisma as adapter } from '@lucia-auth/adapter-prisma'
import { dev } from '$app/environment'
import { prisma } from './prisma'

import { github, google } from '@lucia-auth/oauth/providers'
import { env } from '$env/dynamic/private'

export const auth = lucia({
	adapter: adapter(prisma),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	getUserAttributes: (data) => data,
})

export const githubAuth = github(auth, {
	clientId: env.GITHUB_CLIENT_ID,
	clientSecret: env.GITHUB_CLIENT_SECRET,
})

export const googleAuth = google(auth, {
	clientId: env.GOOGLE_CLIENT_ID,
	clientSecret: env.GOOGLE_CLIENT_SECRET,
	redirectUri: 'https://benev.io/auth/google/callback',
	scope: ['email', 'profile'],
})

export type Auth = typeof auth
