import z from 'zod'
import type { Prisma } from '@prisma/client'
import type { ZodObj } from './utils'

export type AuthUserCreateForm = Omit<Prisma.UserUncheckedCreateInput, 'id'> & {
	password: string
}

const loginForm = {
	email: z.string().email().toLowerCase(),
	password: z.string().min(8),
}
export const loginShema = z.object(loginForm)

const userForm = {
	...loginForm,
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string(),
} satisfies ZodObj<AuthUserCreateForm>
export const userShema = z.object(userForm)
