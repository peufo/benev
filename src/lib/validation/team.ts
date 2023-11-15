import { z, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'

type TeamShemaCreate = Omit<Prisma.TeamCreateInput, 'event'>
type TeamShemaUpdate = Omit<Prisma.TeamUpdateInput, 'event'>

const create = {
	name: z.string().min(3),
	description: z.string().optional(),
	leaders: z.relations('connect'),
} satisfies ZodObj<TeamShemaCreate>

const update = {
	...create,
	leaders: z.relations('set'),
} satisfies ZodObj<TeamShemaUpdate>

export const teamShemaCreate = z.object(create)
export const teamShemaUpdate = z.object(update)
