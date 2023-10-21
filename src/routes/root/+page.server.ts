import { prisma, tryOrFail } from '$lib/server'

export const load = async () => ({
	timezoneOffsetServer: new Date().getTimezoneOffset(),
})

export const actions = {
	generate_all_avatars: async () => {
		return tryOrFail(async () => {
			//@ts-ignore
			const users = await prisma.user.findMany({ where: { avatarPlaceholder: { not: null } } })
			await Promise.all(
				users.map(({ id }) => {
					console.log(id)
					const avatarUrl = new URL('https://api.dicebear.com/7.x/avataaars/svg')
					avatarUrl.searchParams.append('seed', String(Math.random()))
					const avatarPlaceholder = avatarUrl.toString()
					return prisma.user.update({ where: { id }, data: { avatarPlaceholder } })
				})
			)
			return
		})
	},
}
