import { jsonParse } from '$lib/jsonParse'
import { getAge } from '$lib/utils'
import type { TeamCondition, TeamConditionOperator } from '$lib/validation'
import type { FieldValue, Member, Team, User } from '@prisma/client'

export function isMemberAllowed(
	team: Team,
	member: Member & { user: User; profile: FieldValue[] }
): boolean {
	if (!team.conditions) return true
	const conditions = jsonParse<TeamCondition[]>(team.conditions, [])
	const conditionsOk = conditions.map((condition) => {
		if (condition.type === 'valided') return member.isValidedByEvent
		if (condition.type === 'age') {
			const birthday = member.user.birthday
			if (!birthday) return false
			// TODO: use periods date instead new Date()
			return getAge(birthday) >= condition.args
		}
		const { fieldId, operator, expectedValue } = condition.args
		const fieldValue = member.profile.find((f) => f.id === fieldId)
		if (!fieldValue || expectedValue === undefined) return false
		return testValue[operator](expectedValue, fieldValue.value)
	})
	return conditions.length === conditionsOk.length
}

const testValue: Record<
	TeamConditionOperator,
	(expectedValue: string | string[], value: string) => boolean
> = {
	is: (expectedValue, value) => {
		if (typeof expectedValue === 'string') return expectedValue === value
		return JSON.stringify(expectedValue) === value
	},
	not: (expectedValue, value) => {
		if (typeof expectedValue === 'string') return expectedValue !== value
		return JSON.stringify(expectedValue) !== value
	},
	contains: (expectedValue, value) => {
		if (typeof expectedValue !== 'string') return false
		return expectedValue.includes(value)
	},
	notContains: (expectedValue, value) => {
		if (typeof expectedValue !== 'string') return false
		return !expectedValue.includes(value)
	},
	gt: (expectedValue, value) => {
		const numbers = toNumbers(expectedValue, value)
		if (!numbers) return false
		return numbers.a > numbers.b
	},
	gte: (expectedValue, value) => {
		const numbers = toNumbers(expectedValue, value)
		if (!numbers) return false
		return numbers.a >= numbers.b
	},
	lt: (expectedValue, value) => {
		const numbers = toNumbers(expectedValue, value)
		if (!numbers) return false
		return numbers.a < numbers.b
	},
	lte: (expectedValue, value) => {
		const numbers = toNumbers(expectedValue, value)
		if (!numbers) return false
		return numbers.a <= numbers.b
	},
	haveAny: (expectedValue, value) => {
		if (typeof expectedValue === 'string') return false
		return jsonParse<string[]>(value, []).filter((v) => expectedValue.includes(v)).length > 0
	},
}

function toNumbers(a: string | string[], b: string): { a: number; b: number } | false {
	if (typeof a !== 'string') return false
	const nA = Number(a)
	const nB = Number(b)
	if (Number.isNaN(nA) || Number.isNaN(nB)) return false
	return { a: nA, b: nB }
}
