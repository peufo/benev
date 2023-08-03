import z from 'zod'
import type { Prisma } from '@prisma/client'
import type { ZodObj } from './utils'

export type EventCreateForm = Omit<Prisma.TeamCreateInput, 'event'> & { leaders?: string[] }

const teamForm = {
	name: z.string().min(3),
	description: z.string().optional(),
	leaders: z.array(z.string()).optional(),
} satisfies ZodObj<EventCreateForm>

export const teamShema = z.object(teamForm)
