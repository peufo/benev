import manifest from '#lib/landing/videos.json'
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '#lib/member/roles.js'
import { PERMISSION_ROLES, PERMISSIONS, type Permission } from './permissions'

/**
 * Un composant employé dans une page de documentation ne traverse pas la surface markdown: il faut
 * lui donner un jumeau, dérivé des mêmes données que son rendu Svelte. Le test unitaire qui croise
 * ce registre avec `readComponents()` refuse qu'une entrée manque: sans quoi le `.md` servi
 * perdrait silencieusement un morceau de son contenu.
 *
 * Un jumeau reçoit les attributs de la balise, tels qu'écrits dans la source.
 */
export const DOC_MARKDOWN_PARTS: Record<string, (props: Record<string, string>) => string> = {
	DemoVideo: demoVideoMarkdown,
	RolesGlossary: rolesGlossaryMarkdown,
	WhoCanDoWhat: permissionsMarkdown,
}

/** Une vidéo ne se lit pas: ce qui la remplace dit qu'elle existe, et où la regarder. */
function demoVideoMarkdown({ id, title }: Record<string, string>): string {
	const demo = manifest[id as keyof typeof manifest]
	return demo ? `[Vidéo : ${title}](${demo.video})` : ''
}

function rolesGlossaryMarkdown(): string {
	return PERMISSION_ROLES.map(
		(role) => `**${ROLE_LABELS[role]}**\n\n${ROLE_DESCRIPTIONS[role]}`
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
