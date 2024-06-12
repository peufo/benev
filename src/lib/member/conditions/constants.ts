import type { MemberConditionOperator } from '$lib/models'
import type { FieldType } from '@prisma/client'

export const CONDITION_OPERATOR: Record<FieldType, MemberConditionOperator[]> = {
	boolean: ['equals'],
	number: ['equals', 'gt', 'gte', 'lt', 'lte'],
	string: ['equals', 'not', 'string_contains'],
	textarea: ['equals', 'not', 'string_contains', 'string_starts_with', 'string_ends_with'],
	select: ['equals', 'array_contains', 'array_starts_with', 'array_ends_with'],
	multiselect: ['equals', 'array_contains', 'array_starts_with', 'array_ends_with'],
}

export const CONDITION_OPERATOR_LABEL: Record<MemberConditionOperator, string> = {
	equals: 'Est égal à',
	not: "N'est pas égal à",
	gt: 'Est plus grand que',
	gte: 'Est plus grand ou égal à',
	lt: 'Est plus petit que',
	lte: 'Est plus petit ou égal à',
	string_contains: 'Contient',
	array_contains: 'Contient',
	string_starts_with: 'Commence par',
	array_starts_with: 'Commence par',
	string_ends_with: 'Termine par',
	array_ends_with: 'Termine par',
}
