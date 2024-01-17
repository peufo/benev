import { tableheadComponent, type TableField } from '$lib/material/table'
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
			key: 'subscribes_count',
			label: 'Inscriptions (nombre)',
			visible: true,
			getCell: (m) => m.subscribes.length,
			head: tableheadComponent('number', {}),
		},
		{
			key: 'subscribes_teams',
			label: 'Inscriptions (secteur)',
			visible: true,
			getCell: (m) =>
				m.subscribes
					.map((s) => teams.find((t) => t.id === s.period.teamId)?.name || '')
					.filter((team, index, self) => self.indexOf(team) === index),
			head: tableheadComponent('multiselect', {
				options: teams.map((team) => ({ label: team.name, value: team.id })),
			}),
		},
		{
			key: 'subscribes_range',
			label: 'Inscriptions (période)',
			getCell: (m) => {
				if (!m.subscribes.length) return '-'
				const start = Math.min(...m.subscribes.map((s) => s.period.start.getTime()))
				const end = Math.max(...m.subscribes.map((s) => s.period.end.getTime()))
				return formatRange({ start, end })
			},
			visible: true,
			head: tableheadComponent('date', {}),
		},
		{
			key: 'subscribes_hours',
			label: 'Heures de travail',
			visible: true,
			getCell: (m) => toHours(m.workTime),
			head: tableheadComponent('number', {}),
		},
		{
			key: 'leaderOf',
			label: 'Secteurs à charges',
			getCell: (m) => m.leaderOf.map(({ name }) => name),
			visible: true,
			head: tableheadComponent('multiselect', {
				options: teams.map((team) => ({ label: team.name, value: team.id })),
			}),
		},
		{
			key: 'age',
			label: 'Age',
			getCell: (m) => getAge(m.user.birthday),
			head: tableheadComponent('number', {}),
		},
		{
			key: 'isUserProfileCompleted',
			label: 'Profil complet',
			getCell: (m) => m.isMemberProfileCompleted && m.isUserProfileCompleted,
			head: tableheadComponent('boolean', {}),
		},
		{
			key: 'isValidedByEvent',
			label: 'Validé par un responsable',
			hint: "Un responsable à confirmé l'inscription du membre",
			getCell: (m) => m.isValidedByEvent,
			head: tableheadComponent('boolean', {}),
		},
		{
			key: 'isValidedByUser',
			label: 'Validé par le membre',
			hint: 'Le membre à confirmé son invitation',
			getCell: (m) => m.isValidedByUser,
			head: tableheadComponent('boolean', {}),
		},
		...fields.map((field) => ({
			key: `field_${field.id}`,
			label: field.name,
			getCell: (m: Member) => m.profileJson[field.id],
			head: (f: TableField) => {
				if (field.type === 'select' || field.type === 'multiselect')
					return tableheadComponent(field.type, {
						options: jsonParse<string[]>(field.options, []),
					})(f)
				return tableheadComponent(field.type, {})(f)
			},
		})),
	]
	return tableFields
}
