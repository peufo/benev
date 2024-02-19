import { jsonParse } from '$lib/jsonParse.js'
import { prisma, tryOrFail } from '$lib/server'

export const actions = {
	generate_all_avatars: async () => {
		const users = await prisma.user.findMany()
		return tryOrFail(async () => {
			await Promise.all(
				users.map(({ id }) => {
					const avatarUrl = new URL('https://api.dicebear.com/7.x/thumbs/svg')
					avatarUrl.searchParams.append('seed', String(Math.random()))
					const avatarPlaceholder = avatarUrl.toString()
					return prisma.user.update({ where: { id }, data: { avatarPlaceholder } })
				})
			)
			return
		})
	},
	generate_all_member_profil: async () => {
		const members = await prisma.member.findMany()
		return tryOrFail(async () => {
			await Promise.all(
				members.map(({ id, profileJson }) => {
					if (profileJson) return
					return prisma.member.update({ where: { id }, data: { profileJson: {} } })
				})
			)
			return
		})
	},
}
