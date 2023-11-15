import { z, type ZodObj } from '$lib/validation'
import type { Prisma } from '@prisma/client'

const login = {
	email: z.string().email().toLowerCase(),
	password: z.string().min(8),
}
export const loginShema = z.object(login)

const register = {
	...login,
	firstName: z.string().min(2).trim(),
	lastName: z.string().min(2).trim(),
	phone: z.string().trim().optional(),
}
export const registerShema = z.object(register)

type UserUpdate = Omit<Prisma.UserUncheckedCreateInput, 'id'>
const userUpdate = {
	email: z.string().email().toLowerCase(),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	phone: z.string().optional(),
	birthday: z.date().optional(),
	street: z.string().optional(),
	zipCode: z.string().optional(),
	city: z.string().optional(),
	wantsNotification: z.boolean().optional(),
} satisfies ZodObj<UserUpdate>
export const userUpdateShema = z.object(userUpdate)
