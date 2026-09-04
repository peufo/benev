import type { MemberRole } from '$lib/server'

/** Du plus doté au moins doté. `MemberRole.svelte` s'en sert pour désigner le rôle affiché. */
export const ROLES_ORDER = ['root', 'owner', 'admin', 'leader', 'member'] as const

/**
 * Les libellés vivent ici plutôt que dans `MemberRole.svelte`: la documentation les rend aussi,
 * y compris en markdown, où aucun composant Svelte ne peut être chargé.
 */
export const ROLE_LABELS: Record<MemberRole, string> = {
	root: '__ROOT_USER__',
	owner: 'Propriétaire',
	admin: 'Administrateur·ice',
	leader: 'Responsable',
	member: 'Membre',
}

/** Ce que chaque rôle est, en une phrase. `root` n'est pas un rôle d'évènement et n'en a pas. */
export const ROLE_DESCRIPTIONS: Record<Exclude<MemberRole, 'root'>, string> = {
	owner: "La personne qui a créé l'évènement.",
	admin: 'Nommé·e par le propriétaire, ce rôle en hérite pratiquement tous les droits.',
	leader:
		'Nommé·e par le propriétaire ou par un·e administrateur·ice, ce rôle gère tout ce qui se ' +
		'rapporte à son secteur.',
	member:
		"Quiconque souhaite s'inscrire à une période de travail: ce rôle suit et modifie ses " +
		'propres inscriptions.',
}
