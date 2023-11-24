import { z } from '$lib/validation'
import { parseFormData, permission, prisma, tryOrFail } from '$lib/server'

export const actions = {
	delete_member: async ({ request, locals, params: { eventId } }) => {
		const { err, data } = await parseFormData(request, {
			memberId: z.string(),
			redirectTo: z.string().optional(),
		})
		if (err) return err

		return tryOrFail(async () => {
			const member = await permission.member(eventId, locals)
			const isSelf = member.id === data.memberId
			if (!isSelf) await permission.admin(eventId, locals)
			if (isSelf && member.roles.includes('owner'))
				throw Error(`Owner can't delete his participation`)

			await prisma.member.delete({
				where: { id: data.memberId, eventId },
			})
		}, data.redirectTo || '/me')
	},
}
