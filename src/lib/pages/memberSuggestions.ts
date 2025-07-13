import objectPath from 'object-path'
import type { Field } from '@prisma/client'
import type { MemberWithComputedValues } from '$lib/server'
import { getAge } from '$lib/utils'
import { domain } from '$lib/email'
import type { NestedPaths } from './nestedPaths'
import type { Replacer } from './injectValues'

type SuggestionItem = { id: string; label: string }
type DataWithMember = { member: MemberWithComputedValues }

const memberStaticSuggestions: Partial<Record<NestedPaths<DataWithMember>, string>> = {
	'member.firstName': 'Prénom',
	'member.lastName': 'Nom de famille',
	'member.email': 'Email',
	'member.phone': 'Téléphone',
	'member.roles': 'Rôles',
	'member.isMemberProfileCompleted': 'Profile de membre complet',
	'member.isUserProfileCompleted': "Profile d'utilisateur complet",
	'member.isValidedByEvent': 'Adhésion validé par les organisateurs',
	'member.isValidedByUser': 'Adhésion validé par le membre',
	'member.event.name': "Nom de l'évènement",
}

// TODO: add 'subscribes', 'teams'
const memberComputedSuggestions: Record<
	string,
	[string, (data: DataWithMember) => string | string[]]
> = {
	age: ['Age', ({ member }) => getAge(member.birthday)],
	name: ['Nom et prénom', ({ member }) => `${member.firstName} ${member.lastName}`],
	address: [
		'Adresse',
		({ member }) =>
			`${member.firstName} ${member.lastName}<br>${member.street}<br>${member.zipCode} ${member.city}`,
	],
	leaderOf: ['Secteurs à charge', ({ member }) => member.leaderOf.map((t) => t.name)],
	me: [
		'Lien vers le tableau de bord',
		({ member }) => {
			const href = `${domain}/${member.eventId}/me`
			return `<a href="${href}">tableau de bord</a>`
		},
	],
	teams: [
		'Lien vers les secteurs',
		({ member }) => `<a href="${domain}/${member.eventId}/teams">secteurs</a>`,
	],
}

export function getMemberSuggestions(fields: Field[]): SuggestionItem[] {
	return [
		...Object.entries(memberStaticSuggestions).map(([id, label]) => ({ id, label: label || '' })),
		...Object.entries(memberComputedSuggestions).map(([id, [label]]) => ({ id, label })),
		...fields.map((field) => ({ id: `field_${field.id}`, label: field.name })),
	]
}

export function getMemberReplacers(props: DataWithMember): Replacer[] {
	return [
		...Object.entries(memberStaticSuggestions).map(([id]) => ({
			id,
			value: objectPath.get(props, id),
		})),
		...Object.entries(memberComputedSuggestions).map(([id, [_, getValue]]) => ({
			id,
			value: getValue(props),
		})),
		...props.member.event.memberFields.map((field) => ({
			id: `field_${field.id}`,
			value:
				props.member.profileJson[field.id] ?? `(valeur manquante pour le champ "${field.name}")`,
		})),
	]
}
