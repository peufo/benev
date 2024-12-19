import type { Member } from '@prisma/client'
import { z, type ZodObj } from 'fuma'

export const modelMemberSetting = {
	isNotifiedSubscribe: z.boolean(),
	isNotifiedLeaderOfSubscribe: z.boolean().default(true),
	isNotifiedAdminOfNewMember: z.boolean().default(true),
} satisfies ZodObj<Partial<Member>>
