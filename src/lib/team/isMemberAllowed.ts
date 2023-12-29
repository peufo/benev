import { jsonParse } from '$lib/jsonParse'
import type { TeamConditionOperator } from '$lib/validation'
import type { FieldValue, Member, Team, User } from '@prisma/client'
import dayjs from 'dayjs'

export function isMemberAllowed(
	conditions: Team['conditions'],
	member: Member & { user: User; profile: FieldValue[] }
): boolean {
	if (!conditions?.length) return true

	const memberProfile: Record<string, FieldValue> = member.profile.reduce(
		(acc, cur) => ({ ...acc, [cur.fieldId]: cur }),
		{}
	)

	const conditionsOk = conditions
		.map((condition) => {
			if (condition.type === 'valided') return member.isValidedByEvent
			if (condition.type === 'age') {
				const birthday = member.user.birthday
				if (!birthday) return false
				// TODO: use periods date instead new Date()
				const today = dayjs()
				const age = today.diff(dayjs(birthday), 'year')
				return age >= Number(condition.args)
			}
			const { fieldId, operator, expectedValue } = condition.args
			const fieldValue = memberProfile[fieldId]
			if (!fieldValue || expectedValue === undefined) return false
			return testValue[operator](expectedValue, fieldValue.value)
		})
		.filter(Boolean)
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
		const reg = new RegExp(expectedValue, 'i')
		return !!value.match(reg)
	},
	notContains: (expectedValue, value) => {
		if (typeof expectedValue !== 'string') return false
		const reg = new RegExp(expectedValue, 'i')
		return !value.match(reg)
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

		const valueIsJsonArray = value.startsWith('[') && value.endsWith(']')
		if (valueIsJsonArray)
			return jsonParse<string[]>(value, []).filter((v) => expectedValue.includes(v)).length > 0
		return expectedValue.includes(value)
	},
}

function toNumbers(a: string | string[], b: string): { a: number; b: number } | false {
	if (typeof a !== 'string') return false
	const nA = Number(a)
	const nB = Number(b)
	if (Number.isNaN(nA) || Number.isNaN(nB)) return false
	return { a: nA, b: nB }
}
