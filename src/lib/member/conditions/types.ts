type ConditionOperator =
	| 'equals'
	| 'string_contains'
	| 'string_starts_with'
	| 'string_ends_with'
	| 'array_contains'
	| 'array_starts_with'
	| 'array_ends_with'
	| 'lt'
	| 'lte'
	| 'gt'
	| 'gte'
	| 'not'

type ConditionMemberValided = { type: 'valided' }
type ConditionMemberAgeMinimal = {
	type: 'age'
	args: number
}
type ConditionMemberProfile = {
	type: 'profile'
	args: {
		fieldId: string
		operator: ConditionOperator
		expectedValue: string | string[] | boolean | number
	}
}
