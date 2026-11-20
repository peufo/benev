import type { EventState } from '@prisma/client'

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
