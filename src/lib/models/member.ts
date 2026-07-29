import type { Member } from '@prisma/client'
import type { ShapeOf } from 'fuma'
import z from 'zod'

type MemberSetting = Pick<
	Member,
	'isNotifiedSubscribe' | 'isNotifiedLeaderOfSubscribe' | 'isNotifiedAdminOfNewMember'
>

export const modelMemberSetting = {
	// Les trois cases ne sont rendues que selon le rôle du membre: une case absente du formulaire
	// retombe sur le défaut, comme avant la migration. `isNotifiedSubscribe` est toujours rendue,
	// donc son absence signifie bien « décochée ».
	isNotifiedSubscribe: z.boolean().default(false),
	isNotifiedLeaderOfSubscribe: z.boolean().default(true),
	isNotifiedAdminOfNewMember: z.boolean().default(true),
} satisfies ShapeOf<MemberSetting>
