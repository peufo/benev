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
}
