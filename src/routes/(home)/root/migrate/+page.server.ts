import { formAction, tryOrFail } from 'fuma/server'
import { permission, prisma } from '$lib/server'

export const actions = {
	update_members_avatarId: formAction({}, async ({ locals }) => {
		await permission.root(locals)
		const users = await prisma.user.findMany()
		let count = 0
		for (const user of users) {
			const res = await prisma.member.updateMany({
				where: { userId: user.id, avatarId: { not: user.avatarId } },
				data: { avatarId: user.avatarId },
			})
			count += res.count
		}
		return { count }
	}),
}
