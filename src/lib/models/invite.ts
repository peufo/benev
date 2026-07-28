import { z } from '$lib/fuma-legacy/validation'

export const modelInvite = {
	email: z.union([z.string().email().toLowerCase(), z.literal('').transform(() => null)]).nullish(),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
}
