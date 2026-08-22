/**
 * Une inscription en attente attend toujours le camp qui ne l'a pas créée: `us` est ce que
 * l'organisateur a à trancher, `member` ce qu'il a proposé et qui reste sans réponse.
 *
 * Le filtre se comporte comme les autres du produit: aucun camp retenu, ce sont les deux qui
 * s'affichent.
 */
export const WAITING = [
	{ key: 'us', label: 'Chez nous', createdBy: 'user' },
	{ key: 'member', label: 'Chez le membre', createdBy: 'leader' },
] as const

export type Waiting = (typeof WAITING)[number]['key']

export const WAITING_KEYS = WAITING.map(({ key }) => key) as [Waiting, ...Waiting[]]

export const waitingOf = (waiting: Waiting) => WAITING.find(({ key }) => key === waiting)!
