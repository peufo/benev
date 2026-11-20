import type { EventState, TeamState } from '@prisma/client'

/**
 * Qui entre dans l'espace d'un évènement. Publié, il est ouvert à tous; en brouillon ou archivé,
 * il est réservé aux responsables (rôle que portent aussi admins et propriétaire) et à root.
 *
 * Le tunnel d'inscription sur invitation fait exception, mais seul le layout sait la reconnaître:
 * il l'ajoute lui-même. Côté serveur, cette règle garde les lectures et les gestes de bénévole.
 */
export function canAccessEvent(
	event: { state: EventState },
	// Les rôles en simples chaînes: ce module est aussi chargé côté client, loin de `#lib/server`.
	member: { roles: readonly string[] } | null | undefined,
	userIsRoot = false
): boolean {
	return event.state === 'published' || !!member?.roles.includes('leader') || userIsRoot
}

/**
 * Une invitation qui ne mènerait qu'à l'annonce attend la publication: le membre sortirait du
 * tunnel sans plus pouvoir revenir. Un rôle ouvre l'espace même fermé, et l'invitation part alors.
 */
export function isInviteHeld(eventState: EventState, { hasRole }: { hasRole: boolean }): boolean {
	return eventState !== 'published' && !hasRole
}

/**
 * Un e-mail aux bénévoles d'un secteur (demande d'inscription, créneau modifié ou supprimé, rappel)
 * attend qu'ils puissent voir ce qu'il annonce: évènement publié, secteur hors brouillon.
 */
export function isVolunteerMailHeld(eventState: EventState, teamState: TeamState): boolean {
	return eventState !== 'published' || teamState === 'draft'
}
