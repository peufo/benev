import { z, toTuple, type ZodObj } from '$lib/validation'
import { type Prisma, type EventState } from '@prisma/client'
import { mdiArchiveOutline, mdiEarth, mdiTestTube } from '@mdi/js'

export type EventCreateInput = Omit<Prisma.EventCreateInput, 'owner'>
export type EventUpdateInput = Omit<Prisma.EventUpdateInput, 'owner'>

export const eventStates: Record<
	EventState,
	{ label: string; icon: string; description: string; class: string }
> = {
	draft: {
		icon: mdiTestTube,
		label: 'Évènement en projet',
		class: 'border-warning bg-warning/50',
		description: 'Seul les responsables ont accès au site.',
	},
	active: {
		icon: mdiEarth,
		label: 'Évènement publié',
		class: 'border-success bg-success/50',
		description: `Le site est disponibles pour tout les mondes.`,
	},
	archived: {
		icon: mdiArchiveOutline,
		label: 'Évènement archivé',
		class: 'bg-base-200',
		description: `Les inscriptions sont fermé et le site est marqué comme inactif.`,
	},
}

const create = {
	id: z.string().toLowerCase().min(3),
	name: z.string().min(3),
	description: z.string().optional(),
	icon: z.string().optional(),
	web: z.string().url().optional().or(z.string().max(0)),
	email: z.string().email().optional().or(z.string().max(0)),
	phone: z.string().optional(),
	address: z.string().optional(),
	state: z.enum(toTuple(eventStates)).optional(),
} satisfies ZodObj<EventCreateInput>

const update = {
	...create,
	name: z.string().min(3).optional(),
} satisfies ZodObj<EventUpdateInput>

export const eventShemaCreate = z.object(create)
export const eventShemaUpdate = z.object(update)
