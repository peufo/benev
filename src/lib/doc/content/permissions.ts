import type { MemberRole } from '$lib/server'

/**
 * `true` accordé · `false` refusé · `undefined` paramétrable par l'organisateur·ice · une chaîne
 * pour une permission conditionnelle, dont le texte est la condition.
 */
export type Permission = boolean | string | undefined

/** Les quatre rôles de la matrice, dans l'ordre décroissant de droits. `root` n'en est pas. */
export const PERMISSION_ROLES = [
	'owner',
	'admin',
	'leader',
	'member',
] as const satisfies readonly Exclude<MemberRole, 'root'>[]

export type PermissionRow = {
	label: string
	/** Une valeur par rôle, dans l'ordre de `PERMISSION_ROLES`. */
	values: [Permission, Permission, Permission, Permission]
}

/**
 * Source unique de la matrice « qui peut faire quoi »: `WhoCanDoWhat.svelte` la rend en tableau
 * HTML, `permissionsMarkdown()` en tableau markdown pour la surface lisible par les machines.
 */
export const PERMISSIONS: PermissionRow[] = [
	{ label: 'Nommer des administrateur·ices', values: [true, false, false, false] },
	{ label: "Supprimer l'évènement", values: [true, false, false, false] },
	{ label: "Configurer l'évènement", values: [true, true, false, false] },
	{ label: 'Modifier les pages', values: [true, true, false, false] },
	{ label: 'Créer et supprimer les secteurs', values: [true, true, false, false] },
	{ label: 'Nommer des responsables de secteurs', values: [true, true, false, false] },
	{
		label: 'Modifier les secteurs (nom, description, etc...)',
		values: [true, true, 'Seulement ses secteurs', false],
	},
	{
		label: 'Gérer les créneaux',
		values: [true, true, 'Seulement les créneaux de ses secteurs', false],
	},
	{
		label: 'Inscrire un membre à un créneau',
		values: [true, true, 'Seulement les créneaux de ses secteurs', false],
	},
	{ label: 'Supprimer un membre', values: [true, true, 'Soi-même', 'Soi-même'] },
	{
		label: 'Modifier les profils de membres',
		values: [true, true, true, 'Son propre profil ( sauf les champs en lecture seul )'],
	},
	{ label: 'Inviter un nouveau membre', values: [true, true, true, false] },
	{
		label: 'Accèder à la liste des membres et des inscriptions',
		values: [true, true, true, false],
	},
	{ label: 'Accèder à la planification', values: [true, true, true, false] },
	{ label: "S'inscrire à un créneau", values: [true, true, true, undefined] },
	{
		label: 'Annuler une inscription',
		values: [
			'Si initiée par un responsable',
			'Si initiée par un responsable',
			'Si initiée par un responsable',
			'Si initiée par soi-même',
		],
	},
	{
		label: 'Confirmer ou décliner une inscription',
		values: [
			'Si initiée par le membre',
			'Si initiée par le membre',
			'Si initiée par le membre',
			'Si initiée par un responsable',
		],
	},
]
