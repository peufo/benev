import z from 'zod'
import type { Prisma } from '@prisma/client'
import type { ZodObj } from './utils'

export type EventCreateForm = Omit<Prisma.EventCreateInput, 'owner'>

const form = {
	id: z.string().toLowerCase().min(3),
	name: z.string().min(3),
	date: z.string().optional(),
	description: z.string().optional(),
	logo: z.string().optional(),
	web: z.string().url().optional().or(z.string().max(0)),
	email: z.string().email().optional().or(z.string().max(0)),
	phone: z.string().optional(),
	address: z.string().optional(),
} satisfies ZodObj<EventCreateForm>

export const eventShema = z.object(form)
