import z from 'zod'
import { zDateNullable, zStringNullable } from './form'

export const modelUserLogin = z.object({
	email: z.string().email().toLowerCase(),
	password: z.string().min(8),
})

export const modelUserCreate = modelUserLogin.extend({
	firstName: z.string().min(2).trim(),
	lastName: z.string().min(2).trim(),
	isOrganizer: z.boolean().optional(),
	// Le défaut est indispensable: une case décochée n'envoie rien, et `form()` refuse un
	// booléen non optionnel. Le refus est donc formulé par le refinement, pas par le type.
	isTermsAccepted: z
		.boolean()
		.default(false)
		.refine((v) => v === true, { message: 'Tu dois accepter les conditions' }),
})

export const modelUserContactUpdate = z.object({
	email: zStringNullable(z.email().toLowerCase()),
	firstName: z.string().min(2).optional(),
	lastName: z.string().min(2).optional(),
	phone: z.string().trim().optional(),
	birthday: zDateNullable,
	street: z.string().optional(),
	zipCode: z.string().optional(),
	city: z.string().optional(),
})

export const modelUserUpdate = modelUserContactUpdate.extend({
	email: z.string().email().toLowerCase().optional(),
	isOrganizer: z.boolean().optional(),
})
