import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '$lib/member/roles'
import { PERMISSION_ROLES, PERMISSIONS, type Permission } from './permissions'

/**
 * Un composant employé dans une page de documentation ne traverse pas la surface markdown: il faut
 * lui donner un jumeau, dérivé des mêmes données que son rendu Svelte. Le test unitaire qui croise
 * ce registre avec `readComponents()` refuse qu'une entrée manque — sans quoi le `.md` servi
 * perdrait silencieusement un morceau de son contenu.
 */
export const DOC_MARKDOWN_PARTS: Record<string, () => string> = {
	RolesGlossary: rolesGlossaryMarkdown,
	WhoCanDoWhat: permissionsMarkdown,
}

function rolesGlossaryMarkdown(): string {
	return PERMISSION_ROLES.map(
		(role) => `**${ROLE_LABELS[role]}** — ${ROLE_DESCRIPTIONS[role]}`
	).join('\n\n')
}

function permissionsMarkdown(): string {
	const header = ['Qui peut faire quoi ?', ...PERMISSION_ROLES.map((role) => ROLE_LABELS[role])]
	const rows = PERMISSIONS.map(({ label, values }) => [label, ...values.map(permissionCell)])
	return [header, header.map(() => '---'), ...rows]
		.map((cells) => `| ${cells.join(' | ')} |`)
		.join('\n')
}

function permissionCell(value: Permission): string {
	if (value === true) return 'oui'
	if (value === false) return 'non'
	// `undefined` marque une permission que l'organisateur·ice ouvre ou ferme dans ses réglages;
	// une chaîne est la condition sous laquelle la permission s'applique.
	if (value === undefined) return 'paramétrable'
	return value
}
