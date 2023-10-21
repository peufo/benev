import { prisma } from '$lib/server'
import { json } from '@sveltejs/kit'

export const load = async () => ({
	timezoneOffsetServer: new Date().getTimezoneOffset(),
})

export const actions = {
	generate_all_avatars: async () => {
		const users = await prisma.user.findMany({ where: { avatarPlaceholder: { contains: '' } } })
		const avatarUrl = new URL('https://api.dicebear.com/7.x/avataaars/svg')
		for (const user of users) {
			avatarUrl.searchParams.append('seed', String(Math.random()))
			const avatarPlaceholder = avatarUrl.toString()
			await prisma.user.update({ where: { id: user.id }, data: { avatarPlaceholder } })
		}
		return json({ generated: users.length })
	},
}
