import { z } from 'fuma'

export const modelInvite = {
	email: z.string().email().toLowerCase(),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
}
