import { z, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'

type TeamShemaCreate = Omit<Prisma.TeamCreateInput, 'event'>
type TeamShemaUpdate = Omit<Prisma.TeamUpdateInput, 'event'>

export const teamCreate = {
	name: z.string().min(3),
	description: z.string().optional(),
	leaders: z.relations('connect'),
	closeSubscribing: z.dateOptional(),
} satisfies ZodObj<TeamShemaCreate>

export const teamUpdate = {
	...teamCreate,
	leaders: z.relations('set'),
} satisfies ZodObj<TeamShemaUpdate>
