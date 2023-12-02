import { z, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'

export const userLogin = {
	email: z.string().email().toLowerCase(),
	password: z.string().min(8),
}

export const userCreate = {
	...userLogin,
	firstName: z.string().min(2).trim(),
	lastName: z.string().min(2).trim(),
	phone: z.string().trim().optional(),
} satisfies ZodObj<Omit<Prisma.UserCreateInput, 'id'> & { password: string }>

export const userUpdate = {
	email: z.string().email().toLowerCase(),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	phone: z.string().optional(),
	birthday: z.dateOptional(),
	street: z.string().optional(),
	zipCode: z.string().optional(),
	city: z.string().optional(),
	wantsNotification: z.boolean().optional(),
} satisfies ZodObj<Prisma.UserUncheckedUpdateInput>
