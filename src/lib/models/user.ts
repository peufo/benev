import { z, type ZodObj } from 'fuma/validation'
import type { Prisma } from '@prisma/client'

export const modelUserLogin = {
	email: z.string().email().toLowerCase(),
	password: z.string().min(8),
}

export const modelUserCreate = {
	...modelUserLogin,
	firstName: z.string().min(2).trim(),
	lastName: z.string().min(2).trim(),
	isOrganizer: z.boolean().optional(),
	isTermsAccepted: z
		.string()
		.refine((v) => v === 'true', { message: 'Tu dois accepter les conditions' })
		.transform((v) => true),
} satisfies ZodObj<Omit<Prisma.UserCreateInput, 'id'> & { password: string }>

export const modelUserUpdate = {
	email: z.string().email().toLowerCase().optional(),
	firstName: z.string().min(2).optional(),
	lastName: z.string().min(2).optional(),
	phone: z.string().trim().optional(),
	birthday: z.date().optional(),
	street: z.string().optional(),
	zipCode: z.string().optional(),
	city: z.string().optional(),
	wantsNotification: z.boolean(),
	isOrganizer: z.boolean().optional(),
} satisfies ZodObj<Prisma.UserUncheckedUpdateInput>
