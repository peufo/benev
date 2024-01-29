import { tableHeadComponent, type TableField } from '$lib/material/table'
import { component, getAge } from '$lib/utils'
import { MemberCell } from '$lib/member'
import { formatRange } from '$lib/formatRange'
import { jsonParse } from '$lib/jsonParse'
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

export function getTableFields(teams: { id: string; name: string }[], fields: Field[]) {
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
			getCell: (m) =>
				m.subscribes
					.map((s) => teams.find((t) => t.id === s.period.teamId)?.name || '')
					.filter((team, index, self) => self.indexOf(team) === index),
			options: teams.map((team) => ({ label: team.name, value: team.id })),
			visible: true,
		},
		{
			key: 'subscribes_count',
			label: 'Inscriptions (nombre)',
			type: 'number',
			getCell: (m) => m.subscribes.length,
		},
		{
			key: 'subscribes_range',
			label: 'Inscriptions (période)',
			type: 'date',
			getCell: (m) => {
				if (!m.subscribes.length) return '-'
				const start = Math.min(...m.subscribes.map((s) => s.period.start.getTime()))
				const end = Math.max(...m.subscribes.map((s) => s.period.end.getTime()))
				return formatRange({ start, end })
			},
		},
		{
			key: 'subscribes_hours',
			label: 'Heures de travail',
			type: 'number',
			getCell: (m) => toHours(m.workTime),
			visible: true,
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
			getCell: (m: Member) => m.profileJson[field.id],
			options: jsonParse<string[]>(field.options, []),
		})),
	]
	return tableFields
}
