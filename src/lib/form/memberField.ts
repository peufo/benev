import z from 'zod'
import type { Prisma, Field } from '@prisma/client'
import { toTuple, type ZodObj } from './utils'
import {
	mdiText,
	mdiNumeric,
	mdiCheckboxIntermediateVariant,
	mdiOrderBoolDescending,
	mdiOrderBoolAscendingVariant,
} from '@mdi/js'

export const memberFieldType: Record<Field['type'], { label: string; icon: string }> = {
	string: { label: 'Text', icon: mdiText },
	number: { label: 'Nombre', icon: mdiNumeric },
	boolean: { label: 'Oui / Non', icon: mdiCheckboxIntermediateVariant },
	select: { label: 'Liste à choix', icon: mdiOrderBoolDescending },
	multiselect: { label: 'Liste à choix multiple', icon: mdiOrderBoolAscendingVariant },
}

const memberFieldForm = {
	name: z.string().min(2),
	memberCanWrite: z.boolean(),
	memberCanRead: z.boolean(),
	description: z.string().optional(),
	options: z.string().optional(),
	type: z.enum(toTuple(memberFieldType)),
} satisfies ZodObj<Omit<Prisma.FieldUncheckedCreateInput, 'eventId'>>

const memberFieldUpdateForm = {
	...memberFieldForm,
	id: z.string(),
}

export const memberFieldShema = z.object(memberFieldForm)
export const memberFieldShemaUpdate = z.object(memberFieldUpdateForm)
