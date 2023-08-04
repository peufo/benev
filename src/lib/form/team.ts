import z from 'zod'
import type { Prisma } from '@prisma/client'
import type { ZodObj } from './utils'

type TeamCreateForm = Omit<Prisma.TeamCreateInput, 'event'> & { leaders?: string[] }

const teamForm = {
	name: z.string().min(3),
	description: z.string().optional(),
	leaders: z.array(z.string()).optional(),
} satisfies ZodObj<TeamCreateForm>

export const teamShema = z.object(teamForm)
