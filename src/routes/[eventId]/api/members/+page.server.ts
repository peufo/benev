import { z } from 'fuma/validation'
import { tryOrFail, parseFormData } from 'fuma/server'
import { permission, prisma } from '$lib/server'

export const actions = {
	delete_member: async ({ request, locals, params: { eventId } }) => {
		return tryOrFail(
			async () => {
				const { data } = await parseFormData(request, {
					memberId: z.string(),
					redirectTo: z.string().optional(),
				})
				const member = await permission.member(eventId, locals)
				const isSelf = member.id === data.memberId
				if (!isSelf) await permission.admin(eventId, locals)
				if (isSelf && member.roles.includes('owner'))
					throw Error(`Owner can't delete his participation`)

				await prisma.member.delete({
					where: { id: data.memberId, eventId },
				})
				return data
			},
			(data) => data.redirectTo || '/me'
		)
	},
}
