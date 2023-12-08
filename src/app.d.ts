// See https://kit.svelte.dev/docs/types#app

import type { MemberWithComputedValues } from '$lib/server'
import type { Event } from '@prisma/client'
import { teamConditionModel } from '$lib/validation'
import zod from 'zod'

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			auth: import('lucia').AuthRequest
		}
		interface PageData {
			member?: MemberWithComputedValues
			event?: Event
		}
		// interface Error {}
		// interface Platform {}
	}
}

/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import('$lib/server').Auth
		type DatabaseUserAttributes = {
			email: string
			isEmailVerified: boolean
			firstName: string
			lastName: string
			phone?: string
			avatarPlaceholder: string
		}
	}
}

declare global {
	namespace PrismaJson {
		type TeamConditions = zod.infer<typeof teamConditionModel>[]
	}
}

export {}
