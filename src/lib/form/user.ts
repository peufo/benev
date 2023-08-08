import z from 'zod'
import type { Prisma, $Enums } from '@prisma/client'
import { toTuple, type ZodObj } from './utils'

type UserCreateForm = Omit<Prisma.UserUncheckedCreateInput, 'id'> & {
	password: string
}

const loginForm = {
	email: z.string().email().toLowerCase(),
	password: z.string().min(8),
}
export const loginShema = z.object(loginForm)

export const userSizeLabel: Record<$Enums.Size, string> = {
	small: 'Small',
	medium: 'Medium',
	large: 'Large',
	xLarge: 'XLarge',
}

const userForm = {
	...loginForm,
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string().optional(),
	size: z.enum(toTuple(userSizeLabel)).optional(),
} satisfies ZodObj<UserCreateForm>
export const userShema = z.object(userForm)
