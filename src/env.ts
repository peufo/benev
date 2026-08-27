import { defineEnvVars } from '@sveltejs/kit/env'
import z from 'zod'
import { building } from '$app/env'

const requiredString = z.string().min(1)
const dynamicString = building
	? requiredString.optional().transform((v) => v ?? '')
	: requiredString

export const variables = defineEnvVars({
	ORIGIN: { public: true, schema: dynamicString },
	ROOT_USER: { schema: dynamicString },
	DATABASE_URL: { schema: dynamicString },
	MEDIA_DIR: { schema: dynamicString },
	BODY_SIZE_LIMIT: { schema: dynamicString },

	SMTP_HOST: { schema: dynamicString },
	SMTP_PORT: { schema: dynamicString },
	SMTP_USER: { schema: dynamicString },
	SMTP_PASS: { schema: dynamicString },
	EMAIL_DISABLED: {
		schema: z
			.string()
			.default(building ? 'true' : '')
			.transform((str) => str !== ''),
	},

	GITHUB_CLIENT_ID: { schema: dynamicString },
	GITHUB_CLIENT_SECRET: { schema: dynamicString },
	GOOGLE_CLIENT_ID: { schema: dynamicString },
	GOOGLE_CLIENT_SECRET: { schema: dynamicString },

	PRIVATE_STRIPE_KEY: { schema: dynamicString },
	PRIVATE_STRIPE_WEBHOOK_KEY: { schema: dynamicString },
	STRIPE_KEY: { public: true, schema: dynamicString },
	PRICE_STANDARD: { public: true, schema: dynamicString },
	PRICE_PREMIUM: { public: true, schema: dynamicString },
	PRICE_STANDARD_TO_PREMIUM: { public: true, schema: dynamicString },
})
