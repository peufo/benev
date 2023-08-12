// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			auth: import('lucia').AuthRequest
		}
		// interface Error {}
		// interface PageData {}
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
		}
	}
}

export {}
