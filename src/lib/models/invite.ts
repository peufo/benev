import { z } from 'fuma'

export const modelInvite = {
	email: z.union([z.string().email().toLowerCase(), z.string().max(0)]),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
}
