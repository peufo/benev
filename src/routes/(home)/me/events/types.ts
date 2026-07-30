import type { getEventMembers } from './events.server'

/**
 * Une adhésion enrichie, telle que la renvoie le `load`. Import de type uniquement:
 * il est effacé à la compilation, le module serveur ne part donc pas au client.
 */
export type EventMember = Awaited<ReturnType<typeof getEventMembers>>[number]
