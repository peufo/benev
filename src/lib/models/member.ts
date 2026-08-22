import type { Member } from '@prisma/client'
import z from 'zod'

type MemberSetting = Pick<
	Member,
	'isNotifiedSubscribe' | 'isNotifiedLeaderOfSubscribe' | 'isNotifiedAdminOfNewMember'
>

export const modelMemberSetting = z.object({
	// Les deux dernières ne sont rendues que selon le rôle du membre: absentes, elles ne touchent
	// à rien, et le membre qui redevient responsable retrouve sa préférence.
	isNotifiedSubscribe: z.boolean().optional(),
	isNotifiedLeaderOfSubscribe: z.boolean().optional(),
	isNotifiedAdminOfNewMember: z.boolean().optional(),
}) satisfies z.ZodType<Partial<MemberSetting>>
