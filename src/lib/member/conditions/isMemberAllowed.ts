import type { MemberConditionOperator } from '$lib/validation'
import type { Member, Team, User } from '@prisma/client'
import dayjs from 'dayjs'

export function isMemberAllowed(
	conditions: Team['conditions'] | null,
	member?: (Member & { user: User }) | null
): boolean {
	if (!conditions?.length) return true
	if (!member) return false

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
			const fieldValue = member.profileJson[fieldId]
			if (fieldValue === undefined || expectedValue === undefined) return false
			return testValue[operator](expectedValue, fieldValue)
		})
		.filter(Boolean)
	return conditions.length === conditionsOk.length
}

type ProfileValue = string | string[] | boolean | number

const testValue: Record<
	MemberConditionOperator,
	(expectedValue: ProfileValue, value: ProfileValue) => boolean
> = {
	equals: (expectedValue, value) => {
		console.log({ expectedValue, value })
		const expectedValueAsArray = asArray(expectedValue)
		const valueAsArray = typeof value === 'boolean' ? [String(value)] : asArray(value)
		return JSON.stringify(expectedValueAsArray) === JSON.stringify(valueAsArray)
	},
	not: (expectedValue, value) => {
		if (!isArray(expectedValue) || !isArray(value)) return expectedValue !== value
		return JSON.stringify(expectedValue) !== JSON.stringify(value)
	},
	string_contains: (expectedValue, value) => {
		if (!isString(expectedValue) || !isString(value)) return false
		const reg = new RegExp(expectedValue, 'i')
		return !!value.match(reg)
	},
	string_starts_with: (expectedValue, value) => {
		if (!isString(expectedValue) || !isString(value)) return false
		const reg = new RegExp(`^${expectedValue}`, 'i')
		return !!value.match(reg)
	},
	string_ends_with: (expectedValue, value) => {
		if (!isString(expectedValue) || !isString(value)) return false
		const reg = new RegExp(`${expectedValue}$`, 'i')
		return !!value.match(reg)
	},
	array_contains: (expectedValue, value) => {
		const valueAsArray = asArray(value)
		if (!isArray(expectedValue))
			return !!valueAsArray.filter((item) => item === expectedValue).length
		return !!valueAsArray.filter((item) => expectedValue.includes(String(item))).length
	},
	array_starts_with: (expectedValue, value) => {
		const valueAsArray = asArray(value)
		if (!isArray(expectedValue)) return valueAsArray.at(-1) === expectedValue
		return (
			valueAsArray.filter((item, index) => item === expectedValue[index]).length ===
			valueAsArray.length
		)
	},
	array_ends_with: (expectedValue, value) => {
		const valueAsArray = asArray(value)
		if (!isArray(expectedValue)) return valueAsArray[0] === expectedValue
		const expectedItems = expectedValue.slice(-valueAsArray.length)
		return JSON.stringify(expectedItems) === JSON.stringify(valueAsArray)
	},
	gt: (expectedValue, value) => {
		if (!isNumber(expectedValue) || !isNumber(value)) return false
		return expectedValue > value
	},
	gte: (expectedValue, value) => {
		if (!isNumber(expectedValue) || !isNumber(value)) return false
		return expectedValue >= value
	},
	lt: (expectedValue, value) => {
		if (!isNumber(expectedValue) || !isNumber(value)) return false
		return expectedValue < value
	},
	lte: (expectedValue, value) => {
		if (!isNumber(expectedValue) || !isNumber(value)) return false
		return expectedValue <= value
	},
}

function asArray(value: ProfileValue): (string | number | boolean)[] {
	return Array.isArray(value) ? value : [value]
}

function isArray(value: ProfileValue): value is string[] {
	return Array.isArray(value)
}

function isString(value: ProfileValue): value is string {
	return typeof value === 'string'
}

function isNumber(value: ProfileValue): value is number {
	return typeof value === 'number'
}
