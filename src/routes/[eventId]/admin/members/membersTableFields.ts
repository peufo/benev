import { type TableField, jsonParse, component } from 'fuma'
import { getAge } from '$lib/utils'
import { MemberCell } from '$lib/member'
import { formatRange } from '$lib/formatRange'
import type { Member } from './getMembers'
import type { Field } from '@prisma/client'

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
	const tableFields: TableField<Member>[] = [
		{
			key: 'member',
			label: 'Membre',
			getCell: (member) => component(MemberCell, { member }),
			locked: true,
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
					...teamsAccepted.map((t) => badge(t)),
					...teamsRequest.map((t) => badge(t, 'badge-warning badge-outline')),
				].join('')
			},
			options: teams.map((team) => ({ label: team.name, value: team.id })),
			visible: true,
		},
		{
			key: 'subscribes_count',
			label: 'Inscriptions (nombre)',
			type: 'number',
			getCell(m) {
				const nbAccepted = m.subscribes.filter((s) => s.state === 'accepted').length
				const nbRequest = m.subscribes.filter((s) => s.state === 'request').length
				let html = ''
				if (nbAccepted) html += badge(nbAccepted)
				if (nbRequest) html += badge(nbRequest, 'badge-warning badge-outline')
				if (html) return html
				return '-'
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
			type: 'date',
			getCell: (m) => getAge(m.user.birthday),
		},
		{
			key: 'isUserProfileCompleted',
			label: 'Profil complet',
			type: 'boolean',
			getCell: (m) => m.isMemberProfileCompleted && m.isUserProfileCompleted,
		},
		{
			key: 'isValidedByEvent',
			label: 'Validé par un responsable',
			type: 'boolean',
			getCell: (m) => m.isValidedByEvent,
			hint: "Un responsable à confirmé l'inscription du membre",
		},
		{
			key: 'isValidedByUser',
			label: 'Validé par le membre',
			type: 'boolean',
			getCell: (m) => m.isValidedByUser,
			hint: 'Le membre à confirmé son invitation',
		},
		...fields.map((field) => ({
			key: `field_${field.id}`,
			type: field.type,
			label: field.name,
			isEditable: true,
			getCell: (m: Member) => m.profileJson[field.id],
			options: jsonParse<string[]>(field.options, []),
		})),
	]
	return tableFields
}

function isUnique<Item extends any>(item: Item, index: number, self: Item[]): boolean {
	return self.indexOf(item) === index
}

const badge = (content: string | number, klass = '') =>
	`<span class="badge mr-1 whitespace-nowrap ${klass}">${content}</span>`
