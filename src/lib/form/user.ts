import z from 'zod'
import type { Prisma, $Enums } from '@prisma/client'
import { toTuple, type ZodObj } from './utils'

const passwordResetForm = {
	email: z.string().email().toLowerCase(),
}
export const passwordResetShema = z.object(passwordResetForm)

const loginForm = {
	email: z.string().email().toLowerCase(),
	password: z.string().min(8),
}
export const loginShema = z.object(loginForm)

const registerForm = {
	...loginForm,
	firstName: z.string().min(2).trim(),
	lastName: z.string().min(2).trim(),
	phone: z.string().trim().optional(),
}
export const registerShema = z.object(registerForm)

type UserForm = Omit<Prisma.UserUncheckedCreateInput, 'id' | 'email'>
const userForm = {
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	phone: z.string().optional(),
	birthday: z.date().optional(),
	street: z.string().optional(),
	zipCode: z.string().optional(),
	city: z.string().optional(),
	wantsNotification: z.boolean().optional(),
} satisfies ZodObj<UserForm>
export const userShema = z.object(userForm)
