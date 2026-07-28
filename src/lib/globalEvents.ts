import type { Field } from '@prisma/client'
import { createEventEmitter } from '$lib/fuma'

export const globalEvents = createEventEmitter<{
	field_created: Field
}>()
