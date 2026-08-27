import z from 'zod'
import { zDateNullable, zStringNullable } from './form'

/**
 * Sur une valeur vide, le message par défaut annonce une adresse malformée: ce n'est pas la forme
 * qui est en cause, c'est l'absence. D'où les deux messages distincts.
 */
export const modelEmail = z
	.email({ error: (issue) => (issue.input === '' ? 'Email requis' : 'Email invalide') })
	.toLowerCase()

export const modelUserLogin = z.object({
	email: modelEmail,
	password: z.string().min(8),
})

export const modelUserCreate = modelUserLogin.extend({
	firstName: z.string().min(2).trim(),
	lastName: z.string().min(2).trim(),
	isOrganizer: z.boolean().optional(),
	// `form()` refuse un booléen non optionnel: le refus est formulé par le refinement, pas par
	// le type — le défaut n'est là que pour lui donner cette forme.
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
	email: z.email().toLowerCase().optional(),
	isOrganizer: z.boolean().optional(),
})
