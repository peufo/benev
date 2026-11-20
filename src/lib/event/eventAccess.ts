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
 * Un e-mail à un membre (inscription, créneau modifié ou supprimé, rappel) attend qu'il puisse voir
 * ce qu'il annonce. Un secteur en brouillon se prépare en silence pour tous, mais un évènement fermé
 * ne retient que ce qui va à un membre sans rôle, le seul qu'il laisse dehors. Les responsables,
 * destinataires des demandes d'un membre, en ont toujours un.
 */
export function isMemberMailHeld(
	eventState: EventState,
	teamState: TeamState,
	{ hasRole }: { hasRole: boolean }
): boolean {
	return teamState === 'draft' || (eventState !== 'published' && !hasRole)
}
