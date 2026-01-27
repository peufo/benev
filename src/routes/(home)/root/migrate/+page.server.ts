import { tryOrFail } from 'fuma/server'
import { prisma } from '$lib/server'

export const actions = {
	copy_user_to_members: () =>
		tryOrFail(async () => {
			const members = await prisma.member.findMany()
			let count = 0

			for (const member of members) {
				if (!member.userId) continue
				const user = await prisma.user.findUniqueOrThrow({ where: { id: member.userId } })
				await prisma.member.update({
					where: { id: member.id },
					data: {
						email: user.email,
						isEmailVerified: user.isEmailVerified,
						firstName: user.firstName,
						lastName: user.lastName,
						phone: user.phone,
						birthday: user.birthday,
						street: user.street,
						zipCode: user.zipCode,
						city: user.city,
						avatarId: user.avatarId,
						avatarPlaceholder: user.avatarPlaceholder,
					},
				})

				console.log(`Member ${++count}/${members.length} copied`)
			}

			return {
				updated: count,
			}
		}),
}
