import z from 'zod'
import { zStringNullable } from './form'

export const modelInvite = z.object({
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	email: zStringNullable(z.email().toLowerCase()),
	// La case est désactivée tant qu'aucune adresse n'est saisie, et un champ désactivé n'est pas
	// soumis: le défaut couvre aussi bien ce cas que celui de la case décochée.
	sendEmail: z.boolean().default(false),
})
