import objectPath from 'object-path'

import type { SuggestionItem } from '$lib/material/input/textRich/suggestion'
import type { Field } from '@prisma/client'
import type { MemberWithComputedValues } from '$lib/server'
import type { NestedPaths } from './nestedPaths'
import { getAge } from '$lib/utils'
import { domain } from '$lib/email'

const memberStaticSuggestions: Partial<Record<NestedPaths<MemberWithComputedValues>, string>> = {
	'user.firstName': 'Prénom',
	'user.lastName': 'Nom de famille',
	'user.email': 'Email',
	'user.phone': 'Téléphone',
	'user.isTermsAccepted': 'Charte accepté',
	roles: 'Rôles',
	isMemberProfileCompleted: 'Profile de membre complet',
	isUserProfileCompleted: "Profile d'utilisateur complet",
	isValidedByEvent: 'Inscription validé par les organisateurs',
	isValidedByUser: 'Inscription validé par le membre',
}

// TODO: add 'subscribes', 'teams'
// TODO: add minimal style with html
const memberComputedSuggestions: Record<
	string,
	[string, (m: MemberWithComputedValues) => string | string[]]
> = {
	age: ['Age', (m) => getAge(m.user.birthday)],
	name: ['Nom et prénom', (m) => `${m.user.firstName} ${m.user.lastName}`],
	address: [
		'Adresse',
		(m) =>
			`${m.user.firstName} ${m.user.lastName}<br>${m.user.street}<br>${m.user.zipCode} ${m.user.city}`,
	],
	leaderOf: ['Secteurs à charge', (m) => m.leaderOf.map((t) => t.name)],
	me: [
		'Lien vers le tableau de bord',
		(m) => `<a href="${domain}/${m.eventId}/me">tableau de bord</a>`,
	],
}

export function getMemberSuggestions(fields: Field[]): SuggestionItem[] {
	return [
		...Object.entries(memberStaticSuggestions).map(([id, label]) => ({ id, label: label || '' })),
		...Object.entries(memberComputedSuggestions).map(([id, [label]]) => ({ id, label })),
		...fields.map((field) => ({ id: `field_${field.id}`, label: field.name })),
	]
}

export function injectMemberValues(html: string, member: MemberWithComputedValues): string {
	const replacers: { id: string; value: string }[] = [
		...Object.entries(memberStaticSuggestions).map(([id]) => ({
			id,
			value: objectPath.get(member, id),
		})),
		...Object.entries(memberComputedSuggestions).map(([id, [_, getValue]]) => ({
			id,
			value: getValue(member),
		})),
		...member.event.memberFields.map((field) => ({
			id: `field_${field.id}`,
			value: member.profileJson[field.id] ?? `(valeur manquante pour le champ "${field.name}")`,
		})),
	]

	for (const { id, value } of replacers) {
		const regexp = new RegExp(
			`<span class="[\\w\\d\\-! ]+" data-key="${id.replace('.', '\\.')}".*?<\/span>`,
			'g'
		)
		html = html.replaceAll(regexp, valueToHTML(value))
	}
	return html
}

function valueToHTML(value: number | boolean | string | string[]): string {
	if (typeof value === 'string') return value
	if (typeof value === 'number') return value.toString()
	if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
	return '<ul>' + value.map((v) => `<li>${v}</li>`).join('') + '</ul>'
}
