import type { Member } from '@prisma/client'
import z from 'zod'

type MemberSetting = Pick<
	Member,
	'isNotifiedSubscribe' | 'isNotifiedLeaderOfSubscribe' | 'isNotifiedAdminOfNewMember'
>

export const modelMemberSetting = z.object({
	// Les trois cases ne sont rendues que selon le rôle du membre: une case absente du formulaire
	// retombe sur le défaut, comme avant la migration. `isNotifiedSubscribe` est toujours rendue,
	// donc son absence signifie bien « décochée ».
	isNotifiedSubscribe: z.boolean().default(false),
	isNotifiedLeaderOfSubscribe: z.boolean().default(true),
	isNotifiedAdminOfNewMember: z.boolean().default(true),
}) satisfies z.ZodType<MemberSetting>
