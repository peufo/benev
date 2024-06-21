import type { Member } from '@prisma/client'
import { z, type ZodObj } from 'fuma'

export const modelMemberSetting = {
	isNotifiedSubscribe: z.boolean(),
	isNotifiedLeaderOfSubscribe: z.boolean(),
	isNotifiedAdminOfNewMember: z.boolean(),
} satisfies ZodObj<Partial<Member>>
