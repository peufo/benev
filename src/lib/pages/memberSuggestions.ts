import objectPath from 'object-path'

import type { SuggestionItem } from '$lib/material/input/textRich/suggestion'
import type { Field } from '@prisma/client'
import type { MemberWithComputedValues } from '$lib/server'
import { getAge } from '$lib/utils'
import { domain } from '$lib/email'
import type { NestedPaths } from './nestedPaths'
import { type Replacer } from './injectValues'

type DataWithMember = { member: MemberWithComputedValues }

const memberStaticSuggestions: Partial<Record<NestedPaths<DataWithMember>, string>> = {
	'member.user.firstName': 'Prénom',
	'member.user.lastName': 'Nom de famille',
	'member.user.email': 'Email',
	'member.user.phone': 'Téléphone',
	'member.user.isTermsAccepted': 'Charte accepté',
	'member.roles': 'Rôles',
	'member.isMemberProfileCompleted': 'Profile de membre complet',
	'member.isUserProfileCompleted': "Profile d'utilisateur complet",
	'member.isValidedByEvent': 'Inscription validé par les organisateurs',
	'member.isValidedByUser': 'Inscription validé par le membre',
	'member.event.name': "Nom de l'évènement",
}

// TODO: add 'subscribes', 'teams'
const memberComputedSuggestions: Record<
	string,
	[string, (data: DataWithMember) => string | string[]]
> = {
	age: ['Age', ({ member }) => getAge(member.user.birthday)],
	name: ['Nom et prénom', ({ member }) => `${member.user.firstName} ${member.user.lastName}`],
	address: [
		'Adresse',
		({ member }) =>
			`${member.user.firstName} ${member.user.lastName}<br>${member.user.street}<br>${member.user.zipCode} ${member.user.city}`,
	],
	leaderOf: ['Secteurs à charge', ({ member }) => member.leaderOf.map((t) => t.name)],
	me: [
		'Lien vers le tableau de bord',
		({ member }) => `<a href="${domain}/${member.eventId}/me">tableau de bord</a>`,
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

export function getMemberReplacers({ member }: DataWithMember): Replacer[] {
	return [
		...Object.entries(memberStaticSuggestions).map(([id]) => ({
			id,
			value: objectPath.get(member, id),
		})),
		...Object.entries(memberComputedSuggestions).map(([id, [_, getValue]]) => ({
			id,
			value: getValue({ member }),
		})),
		...member.event.memberFields.map((field) => ({
			id: `field_${field.id}`,
			value: member.profileJson[field.id] ?? `(valeur manquante pour le champ "${field.name}")`,
		})),
	]
}
