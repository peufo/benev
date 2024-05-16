import type { Field } from '@prisma/client'
import { createEventEmitter } from 'fuma/utils'

export const globalEvents = createEventEmitter<{
	field_created: Field
}>({
	field_created: [],
})
