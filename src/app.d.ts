// See https://kit.svelte.dev/docs/types#app

import type { MemberWithComputedValues } from '$lib/server'
import type { Event, Media, Team } from '@prisma/client'
import { modelMemberCondition } from '$lib/models'

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			auth: import('lucia').AuthRequest
		}
		interface PageData {
			member?: MemberWithComputedValues
			event?: Event
			medias?: Media[]
			isLeader?: boolean
			team?: Team
			userIsRoot?: boolean
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
		type MemberConditions = (typeof modelMemberCondition)['_output'][]
		type MemberProfile = Record<string, string | string[] | number | boolean | undefined | null>
		/**
		 * Lieu, partagé par Event et à terme Team / Period.
		 * `coords` est groupé (et non deux champs optionnels) pour rendre impossible
		 * une latitude sans longitude. Absent pour les lieux issus de l'ancien champ
		 * texte, qui n'ont jamais été géocodés: le lien retombe sur une recherche.
		 */
		type Location = { label: string; coords?: { lat: number; lon: number } }
	}
}

export {}
