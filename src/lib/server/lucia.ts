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

// Google valide l'URI de redirection à l'exact: elle doit suivre le domaine servi,
// sinon `dev.benev.io` renvoie ses utilisateurs sur la production.
const origin = dev ? 'http://localhost:5173' : env.ORIGIN || 'https://benev.io'

export const googleAuth = google(auth, {
	clientId: env.GOOGLE_CLIENT_ID,
	clientSecret: env.GOOGLE_CLIENT_SECRET,
	redirectUri: `${origin}/auth/google/callback`,
	scope: ['email', 'profile'],
})

export type Auth = typeof auth
