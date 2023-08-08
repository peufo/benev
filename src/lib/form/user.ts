import z from 'zod'
import type { Prisma, $Enums } from '@prisma/client'
import { toTuple, type ZodObj } from './utils'

const loginForm = {
	email: z.string().email().toLowerCase(),
	password: z.string().min(8),
}
export const loginShema = z.object(loginForm)

const registerForm = {
	...loginForm,
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	phone: z.string().optional(),
}
export const registerShema = z.object(registerForm)

export const userSizeLabel: Record<$Enums.Size, string> = {
	small: 'Small',
	medium: 'Medium',
	large: 'Large',
	xLarge: 'XLarge',
}

type UserForm = Omit<Prisma.UserUncheckedCreateInput, 'id' | 'email'>
const userForm = {
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	phone: z.string().optional(),
	size: z.enum(toTuple(userSizeLabel)).optional(),
	birthday: z.date().optional(),
	street: z.string().optional(),
	zipCode: z.string().optional(),
	city: z.string().optional(),
	isInsured: z.boolean().optional(),
	diet: z.string().optional(),
	skillString: z.string().optional(),
	comment: z.string().optional(),
} satisfies ZodObj<UserForm>
export const userShema = z.object(userForm)
