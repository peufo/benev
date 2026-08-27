import { defineEnvVars } from '@sveltejs/kit/env'
import z from 'zod'

export const variables = defineEnvVars({
	ORIGIN: { public: true },
	ROOT_USER: {},
	DATABASE_URL: {},
	MEDIA_DIR: {},
	BODY_SIZE_LIMIT: {},

	SMTP_HOST: {},
	SMTP_PORT: {},
	SMTP_USER: {},
	SMTP_PASS: {},
	EMAIL_DISABLED: {
		schema: z
			.string()
			.default('')
			.transform((str) => str !== ''),
	},

	GITHUB_CLIENT_ID: {},
	GITHUB_CLIENT_SECRET: {},
	GOOGLE_CLIENT_ID: {},
	GOOGLE_CLIENT_SECRET: {},

	PRIVATE_STRIPE_KEY: {},
	PRIVATE_STRIPE_WEBHOOK_KEY: {},
	STRIPE_KEY: { public: true },
	PRICE_STANDARD: { public: true },
	PRICE_PREMIUM: { public: true },
	PRICE_STANDARD_TO_PREMIUM: { public: true },
})
