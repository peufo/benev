import type { Snippet } from 'svelte'
import { jsonParse, type TableField } from 'fuma'
import type { Field } from '@prisma/client'
import { getAge } from '$lib/utils'
import { formatRange } from '$lib/formatRange'
import type { MemberWithComputedValue } from './getMembers.server'

type Team = { id: string; name: string }

/**
 * Les colonnes qui rendent autre chose qu'une valeur brute prennent leur markup de la page:
 * un snippet ne se déclare que dans un composant.
 */
type MemberCellSnippets = {
	member: Snippet<[MemberWithComputedValue]>
	subscribesTeams: Snippet<[MemberWithComputedValue]>
	subscribesCountRequest: Snippet<[MemberWithComputedValue]>
	subscribesHours: Snippet<[MemberWithComputedValue]>
}

/** Secteurs auxquels le membre est inscrit, séparés par état: le rendu les distingue. */
export function getSubscribedTeams(member: MemberWithComputedValue, teams: Team[]) {
	const teamsName = teams.reduce<Record<string, string>>(
		(acc, t) => ({ ...acc, [t.id]: t.name }),
		{}
	)
	const accepted = member.subscribes
		.filter((s) => s.state === 'accepted')
		.map((s) => teamsName[s.period.teamId])
		.filter(isUnique)
	const request = member.subscribes
		.filter((s) => s.state === 'request')
		.map((s) => teamsName[s.period.teamId])
		.filter(isUnique)
		.filter((team) => !accepted.includes(team))
	return { accepted, request }
}

export function getMembersTableFields(
	teams: Team[],
	fields: Field[],
	snippets: MemberCellSnippets
) {
	const tableFields: TableField<MemberWithComputedValue>[] = [
		{
			key: 'member',
			label: 'Membre',
			cell: () => snippets.member,
			locked: true,
		},
		{
			key: 'createdAt',
			label: 'Adhésion',
			cell: (member) => member.createdAt.toLocaleDateString(),
			type: 'date',
			visible: false,
		},
		{
			key: 'member.email',
			label: 'Email',
			cell: (member) => member.email || '-',
			visible: false,
		},
		{
			key: 'member.phone',
			label: 'Téléphone',
			cell: (member) => member.phone,
			visible: false,
		},
		{
			key: 'subscribes_teams',
			label: 'Inscriptions (secteur)',
			type: 'multiselect',
			cell: () => snippets.subscribesTeams,
			options: teams.map((team) => ({ label: team.name, value: team.id })),
			visible: true,
		},
		{
			key: 'subscribes_count_accepted',
			label: 'Inscriptions acceptés',
			type: 'number',
			// Un nombre se rend déjà dans un badge; à zéro on affiche un tiret.
			cell: (m) => m.subscribesCountAccepted || '-',
		},
		{
			key: 'subscribes_count_request',
			label: 'Inscriptions en attente',
			type: 'number',
			cell: () => snippets.subscribesCountRequest,
		},
		{
			key: 'subscribes_range',
			label: 'Inscriptions (période)',
			type: 'date',
			cell(m) {
				const subscribesAccepted = m.subscribes.filter(({ state }) => state === 'accepted')
				if (!subscribesAccepted.length) return '-'
				const start = Math.min(...subscribesAccepted.map((s) => s.period.start.getTime()))
				const end = Math.max(...subscribesAccepted.map((s) => s.period.end.getTime()))
				return formatRange({ start, end })
			},
		},
		{
			key: 'subscribes_hours',
			label: 'Heures de travail',
			type: 'number',
			visible: true,
			cell: () => snippets.subscribesHours,
		},
		{
			key: 'leaderOf',
			label: 'Secteurs à charges',
			type: 'multiselect',
			cell: (m) => m.leaderOf.map(({ name }) => name),
			options: teams.map((team) => ({ label: team.name, value: team.id })),
		},
		{
			key: 'age',
			label: 'Age',
			type: 'number',
			cell: (m) => getAge(m.birthday),
		},
		{
			key: 'isProfileComplet',
			label: 'Profil complet',
			type: 'boolean',
			cell: (m) => m.isMemberProfileCompleted && m.isUserProfileCompleted,
		},
		{
			key: 'isValidedByEvent',
			label: 'Membre approuvé',
			type: 'boolean',
			cell: (m) => m.isValidedByEvent,
			hint: "Un responsable à confirmé l'inscription du membre",
		},
		{
			key: 'hasAccount',
			label: 'Compte benevio',
			type: 'boolean',
			cell: (m) => !!m.userId,
			hint: 'La personne a lié un compte : elle peut se connecter et gérer ses inscriptions.',
		},
		...fields.map((field) => ({
			key: `field_${field.id}`,
			type: field.type,
			label: field.name,
			sortable: false,
			cell: (m: MemberWithComputedValue) => m.profileJson[field.id],
			options: jsonParse<string[]>(field.options, []),
		})),
	]
	return tableFields
}

function isUnique<Item>(item: Item, index: number, self: Item[]): boolean {
	return self.indexOf(item) === index
}
