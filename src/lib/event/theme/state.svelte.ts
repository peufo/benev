import type { EventTheme } from '$lib/models'

/**
 * L'aperçu de l'habillage: les réglages y écrivent à chaque frappe, `EventTheme` et le layout
 * racine le lisent. Un singleton de module, donc partagé entre les requêtes concurrentes côté
 * serveur — `EventTheme` le repose au montage.
 */
export const theme = $state<EventTheme>({})
