// See https://kit.svelte.dev/docs/types#app

import type { Invite, MemberWithComputedValues } from '$lib/server'
import type { Event, Media, Team } from '@prisma/client'
import { modelMemberCondition } from '$lib/models'
import type { LogDataMap } from '$lib/log/logMap'

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			auth: import('lucia').AuthRequest
		}
		interface PageData {
			member?: MemberWithComputedValues
			/**
			 * La fiche que le tunnel d'inscription peut revendiquer: invitée par jeton, ou retrouvée
			 * par adresse sur un brouillon. Elle n'est reliée à aucun compte — ses rôles ne valent
			 * rien tant que l'adhésion n'est pas faite.
			 */
			memberToClaim?: MemberWithComputedValues
			/** L'invitation en cours, lue du cookie par le layout racine. Jamais le jeton lui-même. */
			invite?: Invite | null
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
			isTermsAccepted?: boolean
			termsVersion?: string
			termsAcceptedAt?: Date
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
		/**
		 * Charge utile d'une ligne de journal, discriminée par la colonne `type`.
		 * Dérivée des transformations de `$lib/log/logMap` — module feuille, importé ici plutôt
		 * que le baril, qui charge aussi des composants.
		 */
		type JsonLogData = LogDataMap[keyof LogDataMap]
	}
}

export {}
