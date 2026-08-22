/**
 * La section Membres sert deux lectures: qui vient d'arriver, et qui reste à mobiliser. Les deux
 * s'ordonnent pareil — les derniers venus d'abord — seul l'ensemble change.
 *
 * Contrairement aux autres filtres du produit, celui-ci n'a pas d'état vide: une des deux listes
 * est toujours affichée, `last` à défaut.
 */
export const MEMBERS_VIEWS = [
	{ key: 'last', label: 'Derniers arrivés' },
	{ key: 'without', label: 'Sans inscription' },
] as const

export type MembersView = (typeof MEMBERS_VIEWS)[number]['key']

export const MEMBERS_VIEW_KEYS = MEMBERS_VIEWS.map(({ key }) => key) as [
	MembersView,
	...MembersView[],
]

export const MEMBERS_VIEW_DEFAULT = 'last' satisfies MembersView
