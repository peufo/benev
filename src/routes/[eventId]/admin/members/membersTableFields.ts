import { type TableField, jsonParse, component, Badge } from 'fuma'
import type { Field } from '@prisma/client'
import { getAge } from '$lib/utils'
import { MemberCell } from '$lib/member'
import { formatRange } from '$lib/formatRange'
import type { MemberWithComputedValue } from './getMembers'

function toHours(ms: number) {
	const hours = ms / (1000 * 60 * 60)
	return (
		Math.round(hours).toString().padStart(2, '0') +
		':' +
		Math.round((hours % 1) * 60)
			.toString()
			.padStart(2, '0')
	)
}

export function getMembersTableFields(teams: { id: string; name: string }[], fields: Field[]) {
	const tableFields: TableField<MemberWithComputedValue>[] = [
		{
			key: 'member',
			label: 'Membre',
			getCell: (member) => component(MemberCell, { member }),
			locked: true,
		},
		{
			key: 'createdAt',
			label: 'Adhésion',
			getCell: (member) => member.createdAt.toLocaleDateString(),
			type: 'date',
			visible: false,
		},
		{
			key: 'member.user.email',
			label: 'Email',
			getCell: (member) => {
				if (member.user.isHeadlessAccount) return '-'
				return member.user.email
			},
			visible: false,
		},
		{
			key: 'member.user.phone',
			label: 'Téléphone',
			getCell: (member) => member.user.phone,
			visible: false,
		},
		{
			key: 'subscribes_teams',
			label: 'Inscriptions (secteur)',
			type: 'multiselect',
			getCell(m) {
				const teamsName = teams.reduce<Record<string, string>>(
					(acc, t) => ({ ...acc, [t.id]: t.name }),
					{}
				)
				const teamsAccepted = m.subscribes
					.filter((s) => s.state === 'accepted')
					.map((s) => teamsName[s.period.teamId])
					.filter(isUnique)
				const teamsRequest = m.subscribes
					.filter((s) => s.state === 'request')
					.map((s) => teamsName[s.period.teamId])
					.filter(isUnique)
					.filter((team) => !teamsAccepted.includes(team))

				return [
					...teamsAccepted.map((content) => component(Badge, { content })),
					...teamsRequest.map((content) =>
						component(Badge, { content, class: 'badge-warning badge-outline' })
					),
				]
			},
			options: teams.map((team) => ({ label: team.name, value: team.id })),
			visible: true,
		},
		{
			key: 'subscribes_count_accepted',
			label: 'Inscriptions acceptés',
			type: 'number',
			getCell(m) {
				if (!m.subscribesCountAccepted) return '-'
				return component(Badge, { content: m.subscribesCountAccepted.toString() })
			},
		},
		{
			key: 'subscribes_count_request',
			label: 'Inscriptions en attente',
			type: 'number',
			getCell(m) {
				if (!m.subscribesCountRequest) return '-'
				return component(Badge, {
					content: m.subscribesCountRequest.toString(),
					class: 'badge-warning badge-outline',
				})
			},
		},
		{
			key: 'subscribes_range',
			label: 'Inscriptions (période)',
			type: 'date',
			getCell(m) {
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
			getCell(m) {
				if (!m.workTimeRequest) return toHours(m.workTime)
				return `
					<div class="flex items-center">
						<span>${toHours(m.workTime)}</span>
						<span class="opacity-80 ml-1 text-warning text-xs">+${toHours(m.workTimeRequest)}</span>
					</div>
				`
			},
		},
		{
			key: 'leaderOf',
			label: 'Secteurs à charges',
			type: 'multiselect',
			getCell: (m) => m.leaderOf.map(({ name }) => name),
			options: teams.map((team) => ({ label: team.name, value: team.id })),
		},
		{
			key: 'age',
			label: 'Age',
			type: 'number',
			getCell: (m) => getAge(m.user.birthday),
		},
		{
			key: 'isProfileComplet',
			label: 'Profil complet',
			type: 'boolean',
			getCell: (m) => m.isMemberProfileCompleted && m.isUserProfileCompleted,
		},
		{
			key: 'isValidedByEvent',
			label: 'Approuvé par un responsable',
			type: 'boolean',
			getCell: (m) => m.isValidedByEvent,
			hint: "Un responsable à confirmé l'inscription du membre",
		},
		{
			key: 'isValidedByUser',
			label: 'Approuvé par le membre',
			type: 'boolean',
			getCell: (m) => m.isValidedByUser,
			hint: 'Le membre à confirmé son invitation',
		},
		...fields.map((field) => ({
			key: `field_${field.id}`,
			type: field.type,
			label: field.name,
			isEditable: true,
			sortable: false,
			getCell: (m: MemberWithComputedValue) => m.profileJson[field.id],
			options: jsonParse<string[]>(field.options, []),
		})),
	]
	return tableFields
}

function isUnique<Item>(item: Item, index: number, self: Item[]): boolean {
	return self.indexOf(item) === index
}
